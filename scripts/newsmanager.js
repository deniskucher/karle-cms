/**
* News Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.02.20
*/
$.widget('nm.newsmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'news',
        managerId:'news',
        tableSettings:null,
        thobject:null,
        tdobject:null,
        thtoggle:'',
        fieldsForChange:{subject:{address:'#inputsubjde',required:true},
                        subject_en:{address:'#inputsubjen'},
                        content:{address:'inputtextde', required:true, tinymce:true},
                        content_en:{address:'inputtexten', tinymce:true}
                    },
        uploadImgDirObj : {
            'large':{'address':'uploads/news/large/', 'width':'1200'},
            'medium':{'address':'uploads/news/medium/', 'width':'600'},
            // 'original':{'address':'/uploads/news/original/', 'width':'900'},
            'thumbs':{'address':'uploads/news/thumbs/', 'width':'480'}
        },
        refreshTableHandler:'basic.gettabledata',
        tinymceId:['inputtextde','inputtexten'],
        tinyGalleryId:null,
        newsFormData:{},
        fbsettings:null,
        currentEditNews:null,
        sendtoFbFlag:false,
        postToFacebookData:{}
    },
    
    _create: function () {
        var widget = this;
        widget.removeTinymce(widget.options.tinymceId);
        widget.options.tinyGalleryId = Math.floor(Math.random() * 100);

        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });

        this.element.on('mouseover','#news th', function(){
            $(this).find('span.fooicon').css('opacity','1');
            
        });

        this.element.on('mouseout','#news th', function(){
            $(this).find('span.fooicon').css('opacity','0');
        });

        this.element.on('click','#news th.sortable', function(){
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
            widget.toggleTabContent('#news-main-form');
            $('#newsform .switch-edit-content').find('button:not(:first)').hide();
            // setTimeout(function() {widget._tinymceinit()});

        });

        this.element.on('click','#login_fb', function(e) {
            e.preventDefault();
            widget.myFacebookLogin(function(){widget.checkExistPostFb(widget.options.fbPostId)}, function(){widget.notLoginFb()});
        });

        this.element.on('click','div#newsform button.cancel-add', function(){
            $('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            
        });

        this.element.on('click','div#newsform .senddataonserver', function(e) {
            $('#newsform').find('.has-error').removeClass('has-error');
            widget.options.newsFormData = widget.createItem(widget.options.fieldsForChange,'basic.createitem');
            // widget.setActiveTabAfterUpdate();
        });

        this.element.on('click', '.edit-item', function(e) {
            e.preventDefault();
            widget._getNewsItem($(this).closest('tr').data('id'), '#news-main-form');
        });
        this.element.on('click','div#newsform .save-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // var checkedFb = widget.checkFbChecked();
            $('#newsform').find('.has-error').removeClass('has-error');
            widget.options.newsFormData = widget.updateItem();
            // if (checkedFb) {
            //     widget.options.idPostedFb = widget.options.currentEditNews;
            //     widget.getFbPostId('news', widget.options.idPostedFb, 'fb_post_id', function(){widget.beforePostToFb()});
            // };
            // widget.setActiveTabAfterUpdate();
            // widget.clearForm();
        });

        this.element.on('click','div#newsform button.cancel-edit', function(){
            $('div.edititemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            widget.clearForm();
            
        });

        this.element.on('click', 'table#news td.act .delete-item', function(e) {
            if(confirm(widget.options.dict.remove+' '+widget.options.dict[widget.options.tableName]+'?')){
                // widget.deleteItem($(this).closest('tr').data('id'));
                widget.deleteNews($(this).closest('tr').data('id'));
            }
            else{
                e.preventDefault();
            }
        });

        this.element.on('click','div.mce-widget[aria-label=Gallery]', function(){
            widget.options.currentEditorid = $(this).parents('.mce-tinymce').next('textarea').attr('id');
        });
        
        $('body').on('touchstart  click', '.tinygallery-container-'+widget.options.tinyGalleryId+' .gallery-thumbnail-contailer', function() {
            
            tinyMCE.get(widget.options.currentEditorid).selection.setContent('<img src="'+$(this).attr('data-imgsrc')+'" />');
            $( "#gallery-dialog" ).dialog('close');
            return false;
        });

        this.element.on('focus', 'div#newsform .modal-body input[type=text], .modal-body textarea', function() {
            $(this).next().hide();
            
        });
        this.element.on('blur', 'div#newsform .modal-body input[type=text], .modal-body textarea', function() {
            if ($(this).val()=='') $(this).next().show();
            
        });
        
        this.element.on('click', '.page-nav', function (e) {//перенести в entityManager.js
            e.preventDefault();
            widget.drawRowsInTable($(this).data('page'));
            
        });

        this.element.on('click', '.switch-edit-content button', function() {
            var tabHref = $(this).data('href');
            widget.toggleTabContent(tabHref);
            if (tabHref == '#news-photos') {
                $('#send_to_fb').hide();
            }else{
                $('#send_to_fb').show();
            }
        });
        
        this._drawTable();
        this.initFB();
        
    },
	
	_drawTable: function () {
        var widget = this;
        
        var dict = widget.options.dict;
        widget.options.tableSettings = {id: 'news', class:'table table-condensed',
                            attr:{'data-paging-size':'5','data-paging-limit':'2'},
                            };
        widget.options.thobject = {'id':{id:'id', class:'sortable th-filter sortable',attr:null, text:'ID'},
                        'subject':{id:'subject', class:'subject sortable th-filter switchlang',attr:{'data-priority':'3','data-lang':'de'},text:dict.subject},
                        'subject_en':{id:'subject_en', class:'subject sortable th-filter switchlang',attr:{'data-priority':'3','data-lang':'en'}, text:dict.subject_en},
                        'date':{id:'date', class:'sortable th-filter',attr:{'data-priority':'5','data-id':'date'}, text:dict.date},
                        'action':{id:'action', class:null, attr:null,text:dict.act}
                        };
        var acttd = "<div class='btn-group btn-group-xs act'>\
                        <button type='button' class='btn btn-default edit-item' title='Edit' alt='Edit'>\
                            <span class='glyphicon glyphicon-pencil'>\
                        </button>\
                        <button type='button' class='btn btn-default delete-item' title='Delete' alt='Delete'>\
                            <span class='glyphicon glyphicon-trash'>\
                        </button>\
                    </div>";
       
        widget.options.tdobject = {'id':{attr:null, text:'id'},
                                'subject':{attr:{'class':'switchlang', 'data-name':'subject','data-lang':'de'}, text:'subject'},
                                'subject_en':{attr:{'class':'switchlang', 'data-name':'subject_en','data-lang':'en'}, text:'subject_en'},
                                'date':{attr:null, text:'formatsdate',val:'date'},
                                'act':{attr:{'class':'act'}, text:null, append: acttd}
                                };
        widget.getFBSettings(function(){widget.refresh()});
                    
    },
   
    displayTableData:function(_startrow, _finishrow){
        var widget = this;
        
        var items = widget.options.items;
        items.sort(widget.sortItems);

        widget.options.tbody.empty();
        
        for (var i = _startrow; i < _finishrow; i++) {
            var item = items[i];
            
            var tdobject = widget.options.tdobject;
            widget.options.tbody.append(
                $tr = $('<tr/>', {'data-id': item.id, class:'expanded'})
            );

            for (var key in tdobject) {
                var text = (item[tdobject[key].text])? item[tdobject[key].text]: '';
                var val = (item[tdobject[key].val])? item[tdobject[key].val]: '';
                var append = (tdobject[key]['append'])? tdobject[key]['append']: '';
                $tr.append(
                    $td = $('<td/>').attr(tdobject[key].attr).text(text).val(val).append(append)
                );
            };

        };
    },

    createItemsForm:function(){
        var widget = this;
        var textde = document.createElement('textarea');
        var texten = document.createElement('textarea');
        textde.setAttribute('id','inputtextde');
        textde.setAttribute('rows','6');
        textde.setAttribute('cols','80');
        textde.classList.add('tinymce');
        texten.setAttribute('id','inputtexten');
        texten.setAttribute('rows','6');
        texten.setAttribute('cols','80');
        if ($('#'+widget.options.tableid+'form').length == 0) {
            $('div.card').append(
                $('<div/>', {class:'additemsform itemsform-hidden', id:widget.options.tableid+'form'}).append(
                    $('<div/>',{class:'btn-group switch-edit-content'}).append(
                        $('<button/>',{class:'btn btn-default active'}).attr('data-href','#news-main-form').text('Main information'),
                        $('<button/>',{class:'btn btn-default'}).attr('data-href','#news-photos').css('display','none').text('Photos')
                    ),
                    $('<div/>',{class:'tab-content'}).append(
                        $('<div/>',{class:'tab-pane active', id:'news-main-form'}).append(
                            $('<div/>',{class:'itemsform-dialog'}).append(
                                $('<div/>',{class:'itemsform-content'}).append(
                                    $('<div/>',{class:'modal-header'}).append(
                                        // $('<button/>', {class:'close', type:'button'}).attr('data-dismiss','modal').html('&#215;'),
                                        $('<h4/>', {class:'modal-title'}).text(widget.options.dict.create+' '+widget.options.dict[widget.options.tableName])
                                    ),
                                    $('<div/>',{class:'modal-body'}).append(
                                        $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                            $('<div/>',{class:'form-group responsive-label required'}).append(
                                                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputsubjde').html(widget.options.dict.subject_de),
                                                $('<div/>',{class:'col-sm-7'}).append(
                                                    $('<input/>',{class:'form-control', type:'text', id:'inputsubjde'}).attr('placeholder', widget.options.dict.input_subjde_pl_holder),
                                                    $('<span/>',{class:'error-form'})
                                                )
                                            ),
                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputsubjen').html(widget.options.dict.subject_en),
                                                $('<div/>',{class:'col-sm-7'}).append(
                                                    $('<input/>',{class:'form-control', type:'text', id:'inputsubjen'}).attr('placeholder', widget.options.dict.input_subjen_pl_holder),
                                                    $('<span/>',{class:'error-form'})
                                                )
                                            ),
                                            $('<div/>',{class:'form-group responsive-label required'}).append(
                                                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputtextde').html(widget.options.dict.text_de),
                                                $('<div/>',{class:'col-sm-7'}).append(
                                                    textde,
                                                    // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtextde'}).attr('placeholder',widget.options.dict.input_textde_pl_holder),
                                                    $('<span/>',{class:'error-form'})
                                                )
                                            ),
                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputtexten').html(widget.options.dict.text_en),
                                                $('<div/>',{class:'col-sm-7'}).append(
                                                    texten,
                                                    // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtexten'}).attr('placeholder',widget.options.dict.input_texten_pl_holder),
                                                    $('<span/>',{class:'error-form'})
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        $('<div/>',{class:'tab-pane', id:'news-photos'})
                    ),
                    $('<div/>', {class:'modal-footer col-sm-10', id:'footer'}).append(
                        $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.create),
                        $('<button/>', {class: 'btn btn-default cancel-add', type:'button'}).text(widget.options.dict.cancel)
                    )
                )
            )
        }
        
        
    },
    _getNewsItem: function(_itemid, _tabid){
        var widget = this;
        $('#news-photo-block').remove();
        $('#'+widget.options.tableName+'form').find('.has-error').removeClass('has-error');
        $('div.card-heading').hide(); 
        $('#newsform .switch-edit-content').find('button').show();
        widget.options.currentEditNews = _itemid;
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
                    var itemsImg = response.data.itemsimg;
                    var form = $('div#'+widget.options.tableid+'form').attr('data-id', _itemid);
                    form.find('.modal-title').text(widget.options.dict.edit+' '+widget.options.dict.news+' #'+_itemid);
                    form.find('span.error-form').text('');
                    form.find('input#inputsubjde').val(item.subject);
                    form.find('input#inputsubjen').val(item.subject_en);
                   
                    tinyMCE.get('inputtextde').setContent(item.content);
                    tinyMCE.get('inputtexten').setContent(item.content_en);
                    form.removeClass('additemsform itemsform-hidden').addClass('edititemsform itemsform-visible');
                    
                    widget.addOptionSendToFacebook(widget.element.find('#footer'));
                    widget.element.find('#news-photos').append(
                        $galleryContent = $('<div/>',{id:'news-photo-block'})
                    );
                    widget.initImagesManager($galleryContent);
                    widget.changeModalFooter(false);
                    widget.toggleTabContent(_tabid);
                }
            }
            
        });
       
    },

    beforePostToFb:function(){
        var widget = this;
        widget.fbGetLoginStatus(function(){widget.checkExistPostFb(widget.options.fbPostId)}, function(){widget.notLoginFb()});
    },

    notLoginFb:function(){
        var widget = this;
        return;
    },

    postToFb:function(_data){
        var widget = this;
        var postToFacebookData = widget.getNewsFbData('newNews', _data);
        widget.options.postToFacebookData = postToFacebookData;
        if (widget.options.sendtoFbFlag) widget.dataPostToFacebook(postToFacebookData);
    },

    updateFbPost:function(_fbPostId){
        var widget = this;
        var fbPostId = _fbPostId;
        var postToFacebookData = widget.getNewsFbData('updateNews');
        widget.options.postToFacebookData = postToFacebookData;
        if (widget.options.sendtoFbFlag) widget.dataPostToFacebook(postToFacebookData, _fbPostId);
    },

    getNewsFbData:function($message, _data){
        var widget = this;
        var lang = widget.options.lang;
        var newsFormData = {};
        var newsId = null;
        if (_data) {
            newsId = _data.id;
            newsFormData = _data[newsId];
        }else{
            newsId = widget.options.currentEditNews;
            newsFormData = widget.options.newsFormData.data[newsId]    
        };
        var description = (lang == 'de')?  newsFormData.content : newsFormData.content_en;
        var description1 = description.replace(/<[^>]+>/g,'');
        
        var description2 = description.replace(/<.*?>/g, '');
        
        var message = widget.options.dict[$message] + ' by ' + new Date();
        
        var data = {
            'message': message,
            'link': String(document.location.origin)+'/'+lang+'/news/view/id/'+newsId,
            'name':(lang == 'de')? newsFormData.subject : newsFormData.subject_en,
            'description': description1
        };

        var imgsrc = widget.element.find('div.gallery-block li.main-image').find('div.gallery-thumbnail-contailer').attr('data-imgsrc');
        if (imgsrc) {
            data.picture = window.location.origin + imgsrc.replace('thumbs', 'large');
        }else{
            data.picture = window.location.origin + '/img/default_fb.png';
        }
        return data;
    },
    
    dataPostToFacebook:function(_data, _fbPostId){
        var widget = this;
        widget.publishToFacebook(_data, null, _fbPostId);
        widget.clearObj(_data);
        widget.setActiveTabAfterUpdate();
    },

    setFbPostId:function(_id){
        var widget = this;
        
        sendRequest({
            action: 'basic.setnewsfbpostid',
            data: {fbPostId:_id, newsId:widget.options.idPostedFb},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    widget.clearObj(widget.options.postToFacebookData);
                }
            }
        });
    },

    setActiveTabAfterUpdate:function(){
        var widget = this;
        var activeTabId = $('.tab-content').children('div.active').attr('id');
        if (activeTabId == 'news-main-form') {
            var nextTab = $('div.switch-edit-content button[data-href=#news-photos]').attr('data-href');
            widget.toggleTabContent(nextTab);
        }else{
            widget.toggleTabContent('#'+activeTabId);
        }
        activeTabId = $('.tab-content').children('div.active').attr('id');
        if (activeTabId !== 'news-main-form') {
            $('#send_to_fb').hide();
        }else{
            $('#send_to_fb').show();    
        }
    },

    initImagesManager:function(_galleryContent){
        var widget = this;
       
        widget.options.ImgThumbEditContainer = "<div class='thumb-box'>\
                            <div class='btn-group btn-group-xs action-bar-image'>\
                                <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                                    <span class='glyphicon glyphicon-trash'>\
                                </button>\
                            </div>\
                            <div class='gallery-thumbnail-contailer'></div>\
                        </div>";

        widget.element.find('#news-photo-block')
            .imagesmanager({
                dict: widget.options.dict,
                imgNameField: 'ni_image',
                imgIdField: 'ni_id', 
                uploadimgdirobj:widget.options.uploadImgDirObj,
                galleryid:'news',
                mainImgDir:'news',
                thumbContainer:widget.options.ImgThumbEditContainer,
                refreshContentAction:'basic.getnewsimages',
                refreshContentData:{newsid: widget.options.currentEditNews, tablename:'news_images'},
                addimgtobdAction:'basic.addnewsimgtobd',
                addimgtobdData:{file: '', newsid:widget.options.currentEditNews},
                deleteImgAction:'basic.deletenewsimgfrombd',
                deleteImgData: {itemid: '', tablename: 'news_images', newsid:widget.options.currentEditNews},
                sortable:false
            });
        
    },

    deleteNews: function (_id) {
        var widget = this;
        var tableName = widget.options.tableName;
        var uploadImgDirObj = widget.options.uploadImgDirObj;
        var uploadImgDirArr = [];
        for (var key in uploadImgDirObj) {
            var address = uploadImgDirObj[key].address;
            // address = address.substr(1);
            uploadImgDirArr.push(address); 
        };
        sendRequest({
            action: 'basic.deletenews',
            data: {itemid: _id, uploadimgdirArr: uploadImgDirArr},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var uploadImgDirArr = response.data.uploadimgdirArr;
                    widget.element.find('tr[data-id='+_id+']').remove();
                    widget.refreshTable();
                }
            }
        });
    },

    actionAfterCreateItem:function(_itemId){
        var widget = this;
        $('.modal-backdrop').remove();
        widget.element.find('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
        $('div.card-heading').show();
        widget.refreshTable($(this).serializeObject(), widget.options.refreshtablehandler);
        widget.clearForm();
        widget._getNewsItem(_itemId, '#news-photos');
    },
    actionAfterUpdateItem:function(){
        var widget = this;
        var checkedFb = widget.checkFbChecked();
        if (checkedFb) {
            widget.options.idPostedFb = widget.options.currentEditNews;
            widget.getFbPostId('news', widget.options.idPostedFb, 'fb_post_id', function(){widget.beforePostToFb()});
        }else{
            // widget.refreshTable($(this).serializeObject(), widget.options.refreshTableHandler);
            widget.setCheckSendToFb();
            widget.setActiveTabAfterUpdate();
        }
        
        return;
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
