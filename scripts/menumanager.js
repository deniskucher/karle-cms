/**
*  Menu Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.28
*/
$.widget('ns.menumanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        name:'menu',
        tableName:'menu',
        managerId:'menu',
        tableid:'menu',
        refreshTableHandler:'basic.getmenu',
        view:'gallery',
        managerBarHidden:['div.input-group'],
        menuType:{'page':'Page','url':'URL','default':'default'},
        fieldsForChange:{title_de:{address:'#input-title_de',required:true},
                        title_en:{address:'#input-title_en',required:true},
                        type:{address:'#input-type',required:true},
                        page_id:{address:'#input-page_id',required:true},
                        url:{address:'#input-url',required:true}
                        },
        acttd:null,
        responsedata:null
        
    },
    

    _create: function () {
        var widget = this;
        
        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });
        
        this.element.on('click','div#menu-manager button.save-menu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            widget.activeMenuItem();
        });
        
        this.element.on('click', '.additems', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // setTimeout(function() { $('div.addnewsform #inputsubjde').focus()}, 500);
            $('div.card-heading').hide();
            widget.addItemsForm();
            $('div.additemsform').removeClass('itemsform-hidden').addClass('itemsform-visible');
        });

        this.element.on('click','div#menuform .senddataonserver', function(e) {
            $('#menuform').find('.has-error').removeClass('has-error');
            var pageType = widget.element.find('select#input-type').val();
            var fieldsForChange = {};
            for (var key in widget.options.fieldsForChange) {
              fieldsForChange[key] = widget.options.fieldsForChange[key];
            }
            if (pageType == 'page'){
                delete fieldsForChange.url;
            }else{
                delete fieldsForChange.page_id;
            }
            widget.createItem(fieldsForChange, 'basic.createmenuitem');

        });
        
        this.element.on('click','div#menuform button.cancel-add', function(){
            $('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
        });

        this.element.on('click', '.delete-item', function(e) {
            if(confirm(widget.options.dict.removemenuitem+'?')){
                var t = $(this).closest('li').data('id');
                widget.deleteItem($(this).closest('li').data('id'));
                widget.activeMenuItem();
            }
            else{
                e.preventDefault();
            }

        });

        this.element.on('click', '.edit-item', function(e) {
            e.preventDefault();
            widget._getMenuItems($(this).closest('li').data('id'));
            widget.activeMenuItem();
        });

        this.element.on('click','div#menuform .save-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#menuform').find('.has-error').removeClass('has-error');
            widget.updateItem();
        });

        this.element.on('click','div#menuform button.cancel-edit', function(){
            $('div.edititemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            widget.clearForm();
        });

        this.element.on('click', '.deactive-item', function (e) {
            e.preventDefault();
            widget.activeMenuItem($(this));
            
        });

        this.element.on('focus', 'div#menuform .modal-body input[type=text]', function() {
            $(this).next().hide();
            
        });
        
        this.element.on('blur', 'div#menuform .modal-body input[type=text]', function() {
            if ($(this).val()=='') $(this).next().show();
            
        });
        
        this.element.on('change','select#input-type',  function() {
            widget.changeInputType();
            
        });

        this.element.on('mousedown dragstart touchstart touchmove', 'li.gallery-list', function(e) {
            var li = $(this);
            widget.options.dragEl = $(this).closest('.gallery-list');
            setTimeout(function() {
                widget.options.dragMove = true;
                if (widget.options.dragMove) {
                    li.attr('draggable',true);
                    widget.options.dragEl.addClass('selected-gallery-el');    
                };
                
            },300);
            
        });
        
        this.element.on('dragend touchend', 'li.gallery-list', function(e) {
            if (widget.options.dragMove) {
                widget.options.dragMove = false;
                $('li.gallery-list').removeClass('selected-gallery-el');
                $('gallery-thumbnail-contailer').removeAttr('draggable'); 
            };
            
        });

        $('body').on('mouseup touchend', function(e) {
            widget.options.dragMove = false;
            $('li.gallery-list').removeClass('selected-gallery-el'); 
        });
            
        this._drawTable();
    },
	
	_drawTable: function () {
        var widget = this;
        
        var dict = widget.options.dict;
        
        widget.options.thobject = {'id':{id:'id', class:'th-filter sortable',attr:null, text:'ID'},
                        'tag_de':{id:'tag_de', class:'tag sortable th-filter',attr:{'data-priority':'1'}, text:dict.tag+' (de)'},
                        'tag_en':{id:'tag_en', class:'tag sortable th-filter',attr:{'data-priority':'3'}, text:dict.tag+' (en)'},
                        'action':{id:'action', class:null, attr:null,text:dict.act}
                        };
        
        widget.options.acttd = "<div class='btn-group btn-group-xs act'>\
                        <button type='button' class='btn btn-default deactive-item' title='Visible' alt='Visible'>\
                            <span class='glyphicon glyphicon-off'>\
                        </button>\
                        <button type='button' class='btn btn-default edit-item' title='edit' alt='edit'>\
                            <span class='glyphicon glyphicon-pencil'>\
                        </button>\
                        <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                            <span class='glyphicon glyphicon-trash'>\
                        </button>\
                    </div>";
        widget.refreshTable();
        
    },
    
    createItemsForm:function(){
        var widget = this;
        
        if ($('#'+widget.options.managerId+'form').length == 0) {
            $('div.card').append(
                $('<div/>', {class:'additemsform itemsform-hidden', id:widget.options.managerId+'form'}).append(
                    $('<div/>',{class:'itemsform-dialog'}).append(
                        $('<div/>',{class:'itemsform-content'}).append(
                            $('<div/>',{class:'modal-header'}).append(
                                // $('<button/>', {class:'close', type:'button'}).attr('data-dismiss','modal').html('&#215;'),
                                $('<h4/>', {class:'modal-title'}).text(widget.options.dict.createmenuitem)
                            ),
                            $('<div/>',{class:'modal-body'}).append(
                                $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-title_de').text(widget.options.dict.title+' (de)'),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-title_de'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.title+' (de)'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-title_en').text(widget.options.dict.title+' (en)'),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-title_en'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.title+' (en)'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-type').text(widget.options.dict.type),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<select/>',{class:'form-control', id:'input-type'}).append(
                                                $('<option/>').text(widget.options.dict.page).val('page'),
                                                $('<option/>').text(widget.options.dict.url).val('url')
                                            ),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-page_id').text(widget.options.dict.page),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<select/>',{class:'form-control', id:'input-page_id'}),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-url').text(widget.options.dict.url),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-url'}).attr('placeholder', widget.options.dict.input+' URL'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    )
                                    
                                )
                                
                            )
                        ),
                        $('<div/>', {class:'modal-footer col-sm-11 col-lg-10', id:'footer'}).append(
                            $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.create),
                            $('<button/>', {class: 'btn btn-default cancel-add', type:'button'}).text(widget.options.dict.cancel)
                        )
                    )
                )
            )
            var lang = widget.options.lang;
            var inputPageId = $('select#input-page_id');
            var pagesItems = widget.options.responsedata.pagesitems;
            for(key in pagesItems){
                if (lang == 'en') {
                    inputPageId.append(
                        $('<option/>').text(pagesItems[key].title_en+' ['+pagesItems[key].slug_en+']').val(pagesItems[key].id)
                    );
                }else if (lang == 'de') {
                    inputpageid.append(
                        $('<option/>').text(pagesItems[key].title_de+' ['+pagesItems[key].slug_de+']').val(pagesItems[key].id)
                    );
                };
                
            };
            widget.changeInputType();
            
        }
    },
    
    drawBlocksContent:function(){
        var widget = this;
        var gallery = $('ul.gallery-data');
        for (var i = 0; i < widget.options.items.length; i++) {
            var item = widget.options.items[i];
            gallery.append(
                $current = $('<li/>',{class:'gallery-list col-lg-2 col-md-3 col-sm-3 col-xs-6'}).attr({'data-id':item.id, 'draggable':'true'}).append(
                    widget.options.acttd,
                    $('<h3/>', {class:'switchlang'}).attr('data-lang','de').text(item.title_de),
                    $('<h3/>', {class:'switchlang'}).attr('data-lang','en').text(item.title_en),
                    $('<p/>').text('Type: '+item.type),
                    $('<p/>',{class:'switchlang page-title', id:'page-title-de'}).attr('data-lang','de').text(item.titlede_p),
                    $('<p/>',{class:'switchlang page-title', id:'page-title-en'}).attr('data-lang','en').text(item.titleen_p),
                    $('<p/>',{id:'page-url'}).text(item.url)
                )
            );
        if (item.visible == 'n') $current.find('div.act button.deactive-item').addClass('deleted').attr({'title':'Invisible','alt':'Invisible'});
        if (item.type == 'default') $current.find('div.act button.edit-item').css('display','none').next().css('display','none');
        if ((item.type == 'page') || (item.type == 'default')) {
                $current.find('p#page-url').addClass('invisible-el');
            }else if(item.type == 'url'){
                $current.find('p.page-title').addClass('invisible-el');
            }
        };
        $('div.manager-footer').append(
            $('<div/>', {class:'col-xs-12 col-md-offset-10 col-md-2'}).append(
                $('<button/>', {class: 'btn btn-primary save-'+widget.options.managerId, type:'submit', title:widget.options.dict.save+' '+widget.options.dict.settings}).text(widget.options.dict.save)
            )
            
        );
        var galleryid = document.getElementById("gallery-menu");
        // Sortable.create(galleryid, { group: "gallery" });
        Sortable.create(galleryid, { 
            group: "menu-items",
            animation: 400,
            delay:300,
            // Задаем фильтр 
            filter: null,
            // Обработка фильтра
            onFilter: function (evt) {
                var ctrl = evt.target;
                
                // Проверяем элемент, на который нажали
                if (Sortable.utils.is(ctrl, null)) {
                    evt.preventDefault();
                }
            }
            
        });
        
    },
    
    _getMenuItems: function(_itemid){
        var widget = this;
        $('#'+widget.options.tableName+'form').find('.has-error').removeClass('has-error');
        $('div.card-heading').hide(); 
        
        sendRequest({
            action: 'basic.getmenuitems',
            data: {itemid: _itemid,tablename:widget.options.tableName},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var item = response.data.item;
                    // var itemsimg = response.data.itemsimg;
                    var form = $('div#'+widget.options.tableid+'form').attr('data-id', _itemid);
                    form.find('.modal-title').text(widget.options.dict.edit+' '+widget.options.dict.menu+' item');
                    form.find('span.error-form').text('');
                    form.removeClass('additemsform itemsform-hidden').addClass('edititemsform itemsform-visible');
                    form.find('#input-title_de').val(item.title_de);
                    form.find('#input-title_en').val(item.title_en);
                    form.find('#input-type').val(item.type);
                    var pagesItems = widget.options.responsedata.pagesitems;
                    form.find('#input-page_id').val(item.page_id);
                    form.find('#input-url').val(item.url);

                    $('.modal-footer').empty().append(
                        $('<button/>', {class: 'btn btn-primary save-item', type:'submit'}).text(widget.options.dict.save),
                        $('<button/>', {class: 'btn btn-default cancel-edit', type:'button'}).text(widget.options.dict.cancel)
                    );
                    widget.changeInputType();
                }
            }
            
        });
        
    },
    activeMenuItem:function(_el){
        var widget = this;
        var data = {};
        var menuOrderObj = {};
        var galleryListOrder = $('div#menu-manager').find('li.gallery-list');
        for (var i = 0; i < galleryListOrder.length; i++) {
            var itemid = galleryListOrder[i].getAttribute('data-id');
            menuOrderObj[itemid] = i;
        };
        data.menuorder = menuOrderObj;
        if (_el) {
            var itemid = _el.closest('li').data('id');
            (_el.hasClass('deleted'))?  data.data = {'visible' : 'y'} :  data.data = {'visible' : 'n'};

        };
        data.itemid = itemid;
        data.tablename = widget.options.tableName;
        sendRequest({
            action: 'basic.activemenuitem',
            data: data,
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.refreshTable();
                }
            }
            
        });

    },

    changeInputType:function(){
        var widget = this;
        var menuForm = $('#menuform');
        var pageType = widget.element.find('select#input-type').val();
        menuForm.find('.invisible-el').removeClass('invisible-el');
        if (pageType == 'page') {
            menuForm.find('input#input-url').closest('div.form-group').addClass('invisible-el');
        }else{
            menuForm.find('select#input-page_id').closest('div.form-group').addClass('invisible-el');
        }

    }
    
});
(function($) {      // поиск и удаление класса по шаблону // $('p').removeClassWild("status_*");
    $.fn.removeClassWild = function(mask) {
        return this.removeClass(function(index, cls) {
            var re = mask.replace(/\*/g, '\\S+');
            return (cls.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
        });
    };
})(jQuery);
