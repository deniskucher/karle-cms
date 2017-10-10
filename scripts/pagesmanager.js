/**
* Pages Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.04.14
*/
$.widget('nm.pagesmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'pages',
        tableSettings:null,
        thobject:null,
        tdobject:null,
        thtoggle:'',
        togglecount:null,

        fieldsForChange:{title_de:{address:'#input-title_de',required:true},
        				title_en:{address:'#input-title_en',required:true},
        				slug_de:{address:'#input-slug_de',required:true},
        				slug_en:{address:'#input-slug_en',required:true},
        				status:{address:'#input-status', required:true},
						display_sidebar:{address:'#input-display_sidebar', required:true},
						display_topbar:{address:'#input-display_topbar', required:true},
						content_de:{address:'input-content_de', tinymce:true},
						content_en:{address:'input-content_en', tinymce:true},
                        meta_keywords:{address:'#input-meta_keywords'},
                        meta_keywords_en:{address:'#input-meta_meta_keywords_en'},
                        meta_description:{address:'#input-meta_description'},
                        meta_description_en:{address:'#input-meta_description_en'}
                    },
        additionalFieldForChange:{meta_keywords:{address:'#input-meta_keywords'},
						meta_keywords_en:{address:'#input-meta_meta_keywords_en'},
						meta_description:{address:'#input-meta_description'},
						meta_description_en:{address:'#input-meta_description_en'}
					},

        refreshTableHandler:'basic.getpagesdata',
        tinymceId:['input-content_de','input-content_en'],
        tinyGalleryId:null
        
    },
    

    _create: function () {
        var widget = this;
        
        widget.removeTinymce(widget.options.tinymceId);
        widget.options.tinyGalleryId = Math.floor(Math.random() * 100);
        
        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });

        this.element.on('mouseover','th', function(){
            $(this).find('span.fooicon').css('opacity','1');
        });

        this.element.on('mouseout','th', function(){
            $(this).find('span.fooicon').css('opacity','0');
        });

        this.element.on('click','th.sortable', function(){
            widget.toggleSortIcon($(this));

        });

        $(window).bind('resize', function(){
            widget.resizeView();

        });

        this.element.on('click','tbody>tr.expanded', function(e){
            widget.toggleExpandIcon($(this), e.target);
        });

        this.element.on('click', 'button.search', function (e) {
            widget.refreshTable($('.searchfield').val(), widget.options.refreshTableHandler);
        });

        this.element.on('keypress', '.searchfield', function (e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                e.preventDefault();
                widget.refreshTable($(this).val(), widget.options.refreshTableHandler);
            }
            
        });

        this.element.on('keyup', '.searchfield', function (e) {
            var val = $(this).val();
            $('span.remove-search').hide();
            if($(this).val() == ''){
                $('span.remove-search').hide();
            }else{
                $('span.remove-search').show();
            }
            
        });

        this.element.on('click', 'span.remove-search', function (e) {
            $('input.searchfield').val('');
            $('input.searchfield').focus();
            $(this).hide();
        });

        this.element.on('click', '.additems', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // setTimeout(function() { $('div.addnewsform #inputsubjde').focus()}, 500);
            $('div.card-heading').hide();
            widget.addItemsForm();
            $('div.additemsform').removeClass('itemsform-hidden').addClass('itemsform-visible');
        });

        this.element.on('click','div#pagesform button.cancel-add', function(){
            $('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
         });

        this.element.on('click','div#pagesform .senddataonserver', function(e) {
            $('#pagesform').find('.has-error').removeClass('has-error');
            widget.createItem(widget.options.fieldsForChange,'basic.createpage');
        });

        this.element.on('click', '.edit-item', function(e) {
            e.preventDefault();
            widget._getPagesItem($(this).closest('tr').data('id'));
        });

        this.element.on('click','div#pagesform .save-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#pagesform').find('.has-error').removeClass('has-error');
            widget.updateItem();
        });

        this.element.on('click','div#pagesform button.cancel-edit', function(){
            $('div.edititemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            widget.clearForm();
        });

        this.element.on('click', '.delete-item', function(e) {
            if(confirm(widget.options.dict.remove+' '+widget.options.dict[widget.options.tablename]+'?')){
                widget.deleteItem($(this).closest('tr').data('id'));
            }
            else{
                e.preventDefault();
            }
        });

        this.element.on('click','div.mce-widget[aria-label=Gallery]', function(){
            widget.options.currentEditorId = $(this).parents('.mce-tinymce').next('textarea').attr('id');
        });
        
        $('body').on('touchstart  click', '.tinygallery-container-'+widget.options.tinyGalleryId+' .gallery-thumbnail-contailer', function() {
            
            tinyMCE.get(widget.options.currentEditorId).selection.setContent('<img src="'+$(this).attr('data-imgsrc')+'" />');
            $( "#gallery-dialog" ).dialog('close');
            return false;
        });

        this.element.on('focus', 'div#pagesform .modal-body input[type=text], .modal-body textarea', function() {
            $(this).next().hide();
            
        });

        this.element.on('blur', 'div#pagesform .modal-body input[type=text], .modal-body textarea', function() {
            if ($(this).val()=='') $(this).next().show();
        });
        
        this.element.on('click', '.page-nav', function (e) {
            e.preventDefault();
            widget.drawRowsInTable($(this).data('page'));
        });

        
        this._drawTable();
        
    },
	
	_drawTable: function () {
        var widget = this;
        
        var dict = widget.options.dict;
        widget.options.tableSettings = {id: 'pages', class:'table table-condensed',
                            attr:{'data-paging-size':'10','data-paging-limit':'2'},
                            };
        widget.options.thobject = {'id':{id:'id', class:'sortable th-filter sortable',attr:null, text:'ID'},
                        'title':{id:'title_de', class:'title sortable th-filter switchlang',attr:{'data-priority':'2','data-lang':'de'},text:dict.title},
                        'title_en':{id:'title_en', class:'title sortable th-filter switchlang',attr:{'data-priority':'2','data-lang':'en'}, text:dict.title},
                        'slug':{id:'slug_de', class:'slug sortable th-filter switchlang',attr:{'data-priority':'4','data-lang':'de'},text:dict.slug},
                        'slug_en':{id:'slug_en', class:'slug sortable th-filter switchlang',attr:{'data-priority':'4','data-lang':'en'},text:dict.slug},
                        'status':{id:'status', class:'status sortable th-filter',attr:{'data-priority':'6'},text:dict.status},
                        'action':{id:'action', class:null, attr:null,text:dict.act}
                        };
        
        widget.refresh();
                    
    },
   
    displayTableData:function(startrow, finishrow){
        var widget = this;
        var acttd = "<div class='btn-group btn-group-xs act'>\
                        <button type='button' class='btn btn-default edit-item' title='edit' alt='edit'>\
                            <span class='glyphicon glyphicon-pencil'>\
                        </button>\
                        <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                            <span class='glyphicon glyphicon-trash'>\
                        </button>\
                    </div>";
        var items = widget.options.items;
        items.sort(widget.sortItems);

        widget.options.tbody.empty();
        
        for (var i = startrow; i < finishrow; i++) {
            var item = items[i];
            
            $('<tr/>', {'data-id': item.id, class:'expanded'}).append(
                $('<td/>').text(item.id),
                $('<td/>', {class: 'switchlang'}).attr({'data-name':'title_de','data-lang':'de'}).text(item.title_de),
                $('<td/>', {class: 'switchlang'}).attr({'data-name':'title_en','data-lang':'en'}).text(item.title_en),
                $('<td/>', {class: 'switchlang'}).attr({'data-name':'slug_de','data-lang':'de'}).text(item.slug_de),
                $('<td/>', {class: 'switchlang'}).attr({'data-name':'slug_en','data-lang':'en'}).text(item.slug_en),
                $('<td/>').text(item.status),
                $('<td/>', {class: 'act'}).append(acttd)
                
            ).appendTo(widget.options.tbody);

        };
    },

    createItemsForm:function(){
        var widget = this;
        
        var contentde = document.createElement('textarea');
        var contenten = document.createElement('textarea');
        contentde.setAttribute('id','input-content_de');
        contentde.setAttribute('rows','6');
        contentde.setAttribute('cols','80');
        contentde.classList.add('tinymce');
        contenten.setAttribute('id','input-content_en');
        contenten.setAttribute('rows','6');
        contenten.setAttribute('cols','80');

        if ($('#'+widget.options.tableid+'form').length == 0) {
            $('div.card').append(
                $('<div/>', {class:'additemsform itemsform-hidden', id:widget.options.tableid+'form'}).append(
                    $('<div/>',{class:'itemsform-dialog'}).append(
                        $('<div/>',{class:'itemsform-content'}).append(
                            $('<div/>',{class:'modal-header'}).append(
                                $('<h4/>', {class:'modal-title'}).text(widget.options.dict.create+' '+widget.options.dict[widget.options.tableName])
                            ),
                            $('<div/>',{class:'modal-body'}).append(
                                $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-title_de').html(widget.options.dict.title+' (de)'),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-title_de'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.title+' (de)'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-title_en').html(widget.options.dict.title+' (en)'),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-title_en'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.title+' (en)'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-slug_de').html(widget.options.dict.slug+' (de)'),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-slug_de'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.slug+' (de)'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-slug_en').html(widget.options.dict.slug+' (en)'),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'input-slug_en'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.slug+' (en)'),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-status').text(widget.options.dict.status),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<select/>',{class:'form-control', id:'input-status'}).append(
                                                $('<option/>').text(widget.options.dict.published).val('published'),
                                                $('<option/>').text(widget.options.dict.draft).val('draft')
                                            ),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-display_sidebar').text(widget.options.dict.displaysidebar),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<select/>',{class:'form-control', id:'input-display_sidebar'}).append(
                                                $('<option/>').text(widget.options.dict.yes).val('y'),
                                                $('<option/>').text(widget.options.dict.no).val('n')
                                            ),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-display_topbar').text(widget.options.dict.displaytopbar),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            $('<select/>',{class:'form-control', id:'input-display_topbar'}).append(
                                                $('<option/>').text(widget.options.dict.no).val('n'),
                                                $('<option/>').text(widget.options.dict.yes).val('y')
                                            ),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputtextde').html(widget.options.dict.content+' (de)'),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            contentde,
                                            // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtextde'}).attr('placeholder',widget.options.dict.input_textde_pl_holder),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputtexten').html(widget.options.dict.content+' (en)'),
                                        $('<div/>',{class:'col-sm-7'}).append(
                                            contenten,
                                            // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtexten'}).attr('placeholder',widget.options.dict.input_texten_pl_holder),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    )
                                    
                                )
                                
                            )
                            
                        ),
                        $('<div/>', {class:'modal-footer col-sm-10', id:'footer'}).append(
                            $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.create),
                            $('<button/>', {class: 'btn btn-default cancel-add', type:'button'}).text(widget.options.dict.cancel)
                        )
                    )
                )
            )
        }
    },

    _getPagesItem: function(_itemid){
        var widget = this;
        $('#'+widget.options.tableName+'form').find('.has-error').removeClass('has-error');
        $('div.card-heading').hide(); 
        
        sendRequest({
            action: 'basic.getitem',
            data: {itemid: _itemid,tablename:widget.options.tableName},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var item = response.data.item[0];
                    var form = $('div#'+widget.options.tableid+'form').attr('data-id', _itemid);
                    form.find('.onlyforedit').remove();
                    form.find('.form-horizontal').append(
                    	$('<div/>',{class:'form-group responsive-label onlyforedit'}).append(
	                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-meta_keywords').text('Meta keywords'),
	                        $('<div/>',{class:'col-sm-7'}).append(
	                            $('<textarea/>',{class:'form-control',rows:'3',cols:'80', id:'input-meta_keywords'}).val(item.meta_keywords),
	                            $('<span/>',{class:'error-form'})
	                        )
	                    ),
	                    $('<div/>',{class:'form-group responsive-label onlyforedit'}).append(
	                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-meta_meta_keywords_en').text('Meta keywords (en)'),
	                        $('<div/>',{class:'col-sm-7'}).append(
	                            $('<textarea/>',{class:'form-control',rows:'3',cols:'80', id:'input-meta_meta_keywords_en'}).val(item.meta_keywords_en),
	                            $('<span/>',{class:'error-form'})
	                        )
	                    ),
                    	$('<div/>',{class:'form-group responsive-label onlyforedit'}).append(
	                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-meta_description').text('Meta description'),
	                        $('<div/>',{class:'col-sm-7'}).append(
	                            $('<textarea/>',{class:'form-control',rows:'3',cols:'80', id:'input-meta_description'}).val(item.meta_description),
	                            $('<span/>',{class:'error-form'})
	                        )
	                    ),
	                    $('<div/>',{class:'form-group responsive-label onlyforedit'}).append(
	                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-meta_description_en').text('Meta description (en)'),
	                        $('<div/>',{class:'col-sm-7'}).append(
	                            $('<textarea/>',{class:'form-control',rows:'3',cols:'80', id:'input-meta_description_en'}).val(item.meta_description_en),
	                            $('<span/>',{class:'error-form'})
	                        )
	                    )
                    )
                    
                    
                    form.find('.modal-title').text(widget.options.dict.edit+' '+widget.options.dict.pages+' #'+_itemid);
                    form.find('span.error-form').text('');
                    
                    var fieldsForChange = widget.options.fieldsForChange;
                    for (var key in fieldsForChange) {
                    	if (fieldsForChange[key].tinymce) {
			        		tinyMCE.get(fieldsForChange[key].address).setContent(item[key]);
			        	}else{
			        		form.find(fieldsForChange[key].address).val(item[key]);
			        	}
                    }
                    
                    $('.modal-footer').empty().append(
                        $('<button/>', {class: 'btn btn-primary save-item', type:'submit'}).text(widget.options.dict.save),
                        $('<button/>', {class: 'btn btn-default cancel-edit', type:'button'}).text(widget.options.dict.cancel)
                    );
					form.removeClass('additemsform itemsform-hidden').addClass('edititemsform itemsform-visible');
                }
            }
            
        });
                
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
