/**
* Gallery Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.04.03
*/
$.widget('ns.gallerymanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        name:'gallery',
        tableName:'gallery',
        managerId:'gallery',
        tableid:'gallery',
        refreshTableHandler:'basic.getgallery',
        view:'gallery',
        managerBarHidden:['div.manager-wrap'],
        acttd:"<div class='btn-group btn-group-xs action-bar-image'>\
                        <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                            <span class='glyphicon glyphicon-trash'>\
                        </button>\
                    </div>",
        responsedata:null,
        uploadImgDirObj : {
                    'large':{'address':'uploads/gallery/large/', 'width':'1200'},
                    'medium':{'address':'uploads/gallery/medium/', 'width':'720'},
                    // 'original':{'address':'/uploads/gallery/original/', 'width':'900'},
                    'thumbs':{'address':'uploads/gallery/thumbs/', 'width':'320'}
                },
        mainImgDir:'gallery',
        fbsettings:null,
        postToFacebookGalletyImg:[],
        fbAttachedMedia:[],
        countPostToFacebook:0,
        countCheckExistPost:0,
        sendtoFbFlag:false,
        galleryTitleObg:{},
        fbAccesToken:null
    },
    

    _create: function () {
        var widget = this;
        
        this.element.on('focus','input.form-control', function(e) {
            var targetEl = e.target.nodeName;
            if (targetEl == 'INPUT') {
                $(this.element+' li.gallery-list').off('dragstart');
                e.preventDefault();
                e.stopPropagation();
                return;
            };
            return;
        });

        this.element.on('click','button.save-gallery', function() {
            var checkedFb = widget.checkFbChecked();
            if (checkedFb) widget.collcetImageTitleBeforeSave();
        });
        
        this.element.on('click','#login_fb', function(e) {
            e.preventDefault();
            widget.myFacebookLogin(function(){widget.dataPostToFacebook(widget.options.galleryTitleObg)}, function(){widget.notLoginFb()});
        });

        this._drawTable();
        this.initFB();
    },
	
	_drawTable: function () {
        var widget = this;
        widget.getFBSettings(function(){widget.drawWidgetContent()});
    },
    
    drawWidgetContent:function(){
        var widget = this;
        // console.log(widget);
        if (widget.element.find('#gallery-content').length == 0) {
            widget.element.find('.card-heading').append(
                $galleryContent = $('<div/>',{id:'gallery-content'})

            );
            widget.initImagesManager($galleryContent);
            widget.drawContentAfterImagesManager();
        }
    },

    drawContentAfterImagesManager:function(){
        var widget = this;
        
        widget.element.find('div.gallery-block').append(
            $('<div/>',{class:'row manager-footer col-sm-11 col-lg-10'}).append(
                $('<button/>', {class: 'btn btn-primary save-gallery', type:'submit', title:widget.options.dict.save+' '+widget.options.dict.gallery}).text(widget.options.dict.save)
                // $('<a/>',{id:'logoutFB'}).text('logout FB')
            )
        );
        widget.element.find('#send_to_fb').remove();
        widget.addOptionSendToFacebook(widget.element.find('.manager-footer'));
    },

    initImagesManager:function(_galleryContent){
        var widget = this;
        
        $thumbEditContainer = "<div class='thumb-box'>"+widget.options.acttd+"\
                            <div class='gallery-thumbnail-contailer'></div>\
                            <form class='form-horizontal' role='form'>\
                                <div class='form-group responsive-label'>\
                                    <label class='col-xs-12 control-label' for='title_de-'>Title (de)</label>\
                                    <div class='col-xs-12'>\
                                        <input class='form-control' id='title_de-' type='text' data-table-field='title_de' placeholder='"+widget.options.dict.input+' '+widget.options.dict.title+' (de)'+"'>\
                                    </div>\
                                </div>\
                                <div class='form-group responsive-label'>\
                                    <label class='col-xs-12 control-label' for='title_en-'>Title (en)</label>\
                                    <div class='col-xs-12'>\
                                        <input class='form-control' id='title_en-' type='text' data-table-field='title_en' placeholder='"+widget.options.dict.input+' '+widget.options.dict.title+' (en)'+"'>\
                                    </div>\
                                </div>\
                            </form>\
                        </div>";
        var gallery = widget.element.find('#gallery-content');
        gallery.imagesmanager({
                dict: widget.options.dict,
                imgNameField: 'filename', 
                imgIdField: 'id',
                uploadimgdirobj:widget.options.uploadImgDirObj,
                galleryid:'gallery',
                mainImgDir:'gallery',
                thumbContainer:$thumbEditContainer,
                refreshContentAction:widget.options.refreshTableHandler,
                refreshContentData:null,
                addimgtobdAction:'basic.addgalleryimgtobd',
                addimgtobdData:{file: ''},
                deleteImgAction:'basic.deleteitem',
                deleteImgData: {itemid: '', tablename: 'gallery'},
                saveGalleryItemsAction:'basic.updategalleryitems',
                saveGalleryItemsData:{data:{}, tablename: 'gallery'},
                sortable:true
                
            });
    },
    
    createItemsForm:function(){
        var widget = this;
        return;
    },
    
    // fnAfterSaveGalleryItems:function(){
    //     var widget = this;
    //     if (widget.options.sendtoFbFlag)
    //     widget.fbGetLoginStatus();
    // },

    actionAfterUpdateItem:function(){
        var widget = this;
        widget.drawWidgetContent();
    },

    refreshTable:function(){
        var widget = this;
        widget.drawWidgetContent();
    },

    saveGalleryItems:function(){
        var widget = this;
        var data = {};
        var galleryObj = {};
        var galleryListOrder = $('div#gallery-manager').find('li.gallery-list');
        for (var i = 0; i < galleryListOrder.length; i++) {
            var li = galleryListOrder[i];
            var itemid = li.getAttribute('data-id');
            var tde = $('input#title_de-'+itemid).val();
            var ten = $('input#title_en-'+itemid).val();
            
            galleryObj[itemid] = {'order_num':i, 'title_en':ten,'title_de':tde};
        };
        data.data = galleryObj;
        
        data.tablename = widget.options.tableName;
        widget.updateItem(true, 'basic.updategalleryitems', data);
     
    },

    collcetImageTitleBeforeSave:function(){
        var widget = this;
        var galleryTitleObg = widget.options.galleryTitleObg;
        var liGallery = $('#gallery-gallery-ul').find('li.gallery-list');
        liGallery.each( function(){
            var liGalleryId = $(this).data('id');
            var titleDe = $(this).find('input[data-table-field=title_de]').val();
            var titleEn = $(this).find('input[data-table-field=title_en]').val();
            galleryTitleObg[liGalleryId] = {'title_de':titleDe, 'title_en':titleEn};
        });
        widget.options.galleryTitleObg = galleryTitleObg;
        if (widget.options.sendtoFbFlag) widget.fbGetLoginStatus(function(){widget.dataPostToFacebook(widget.options.galleryTitleObg)}, function(){widget.notLoginFb()});
    },

    addimgtobdself:function(_file){
        var widget = this;
        
        var data = {file: _file}
        widget.addimgtobd(data, 'basic.addgalleryimgtobd');

    },

    dataPostToFacebook:function(_galleryTitleObg){
        var widget = this;
        sendRequest({
            action: widget.options.refreshTableHandler,
            data: {},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var images = response.data.images;
                    widget.options.countCheckExistPost = 0;
                    widget.options.postToFacebookGalletyImg.length = 0;
                    widget.options.fbAttachedMedia.length = 0;
                    for (var i = 0; i < images.length; i++) {
                        var image = images[i];
                        var imageId = image['id'];
                        image['title_en'] = _galleryTitleObg[imageId].title_en;
                        image['title_de'] = _galleryTitleObg[imageId].title_de;
                        widget.checkExistPhotoPost(images[i], images.length, widget.options.postToFacebookGalletyImg);
                    };
                    widget.clearObj(widget.options.galleryTitleObg);
                    widget.setCheckSendToFb();
                    // console.log(widget.options.galleryTitleObg);
                }
            }
            
        });
    },

    beforePostToFacebook:function(_image, imagesNum){
        var widget = this;
        var domen = window.location.origin;
        var imgSrc = domen+'/uploads/'+widget.options.mainImgDir+'/large/'+_image.filename;
        imgSrc = imgSrc.toString();
        var title = _image['title_'+widget.options.lang];
        var data = {};
        data.url = imgSrc;
        data.caption = title;
        data.published = false;
        data.access_token = widget.options.fbAccesToken;
        widget.postPhotoToFacebook(data, imagesNum);
    },

    setFbPostId:function(_id){
        var widget = this;
        sendRequest({
            action: 'basic.setfbgalleryimagesid',
            data: {fbPostId:_id, images:widget.options.postToFacebookGalletyImg},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    widget.options.postToFacebookGalletyImg.length = 0;
                }
            }
            
        });
    },

    test:function(){
        var widget = this;
        alert('test');
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
 