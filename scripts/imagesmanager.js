//**********************
$.widget('nm.imagesmanager', {

    options: {
        dummy: 'dummy',
        
        uploadfiles:[],
        uploadimgdirobj:{},
        tablenamephoto:'horse_photos',
        imgmanager:null,
        managerId:null,
        dragEl:null,
        dragElId:0,
        dragMove:false
    },
    

    _create: function () {
        var widget = this;
        
        widget.options.managerId = Math.floor(Math.random() * 1000);
        
        $('body').on('click', '.save-item[save-img='+widget.options.managerId+']', function() {
            // widget.saveOnclickFn();
            widget._savegalleryitems();
        });

        $('body').on('click','button.save-gallery', function() {
            // widget.saveOnclickFn();
            widget._savegalleryitems();
         
        });

        widget.options.imgmanager = $('#'+widget.options.galleryid+'-gallery');

        
        this.element.on('click', '#'+widget.options.galleryid+'-gallery'+' li.gallery-list .delete-item', function() {
            if(confirm(widget.options.dict.removegalleryimg+'?')){
                var currentli = $(this).closest('li');
                var imgid = currentli.data('id');
                widget._deleteimg(imgid);
                widget._deleteimagefromserver(imgid);
            }
            else{
                e.preventDefault();
            }

        });

        this.element.on('mousedown dragstart touchstart touchmove', 'div.sortable-gallery', function(e) {
            widget.options.dragEl = $(this).closest('.gallery-list');
            widget.options.dragElId = widget.options.dragEl.attr('data-id');
            widget.options.dragMove = true;
            setTimeout(function() {
                if (widget.options.dragMove) {
                    widget.options.dragEl.addClass('selected-gallery-el');    
                };
                
            },200);
            
        });
        
        this.element.on('dragend touchend', 'div.sortable-gallery', function(e) {
            if (widget.options.dragMove) {
                widget.options.dragMove = false;
                widget.options.dragEl.removeClass('selected-gallery-el'); 
            };
            
        });

        this._refresh();
        
    },

    _refresh:function(){
        var widget = this;
        
        widget._creategalleryblock();
        widget.refreshcontent();
    },
    
    refreshcontent: function(){
        var widget = this;
      
        sendRequest({
            action: widget.options.refreshContentAction,
            data: widget.options.refreshContentData,
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var gallerydata = widget.element.find('ul.gallery-data').empty();
                    var images = response.data.images;
                    widget.displaythumbscontent(images, gallerydata);
                }
            }
            
        });
        
    },

    displaythumbscontent:function(_thumbsContentObj,_gallerydataObj){
        var widget = this;
        var images = _thumbsContentObj
        var gallerydata = _gallerydataObj;
        for (var i = 0; i < images.length; i++) {
            var item = images[i]
            gallerydata.append(
                $thumbcontainer = $('<li/>',{class:'gallery-list col-lg-2 col-md-3 col-sm-3 col-xs-6'}).attr({'data-id':item[widget.options.imgIdField]}).append(
                    widget.options.thumbContainer
                )
            )
            if (item['main_image']) $thumbcontainer.addClass('main-image').find('span.glyphicon-star-empty').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            if (widget.options.sortable) {
                $thumbcontainer.find('.gallery-thumbnail-contailer').addClass('sortable-gallery').css('background','url(/uploads/'+widget.options.mainImgDir+'/thumbs/'+item[widget.options.imgNameField]+')').attr({'data-imgsrc':'/uploads/'+widget.options.mainImgDir+'/thumbs/'+item[widget.options.imgNameField], 'draggable':true});    
            }else{
                $thumbcontainer.find('.gallery-thumbnail-contailer').css('background','url(/uploads/'+widget.options.mainImgDir+'/thumbs/'+item[widget.options.imgNameField]+')').attr({'data-imgsrc':'/uploads/'+widget.options.mainImgDir+'/thumbs/'+item[widget.options.imgNameField],'img-id':item[widget.options.imgNameField]});
            }
            var labelEl = $thumbcontainer.find('form label');
            var inputEl = $thumbcontainer.find('input.form-control');
            for (var j = 0; j < labelEl.length; j++) {
                var labelfor = labelEl[j].getAttribute('for');
                labelEl[j].setAttribute('for',labelfor+item[widget.options.imgNameField]);
            }
            for (var q = 0; q < inputEl.length; q++) {
                var inputid = inputEl[q].getAttribute('id');
                var inputTableField = inputEl[q].getAttribute('data-table-field');
                inputEl[q].setAttribute('id',inputid+item[widget.options.imgNameField]);
                inputEl[q].value = item[inputTableField]; 
            }
            
        };
        
    },

	_creategalleryblock:function(){
        var widget = this;
        var el = widget.element;
        widget.element.find('#'+widget.options.galleryid+'-gallery').remove();
        widget.element.prepend(
            widget.options.imgmanager = $('<div/>',{id:widget.options.galleryid+'-gallery'}).append(
                $('<div/>',{id:'uploader-gallery'}).append(
                    $fineUploader = $('<div/>',{id:'fine-uploader-gallery'})
                ),
                $('<div/>',{class:'gallery-block'}).append(
                    $('<ul/>', {class: 'gallery-data row', id:widget.options.galleryid+'-gallery-ul'}),
                    $('<div/>', {class:'ripple'})
                ) 
            )
            
        );
        widget._initfineUploader($fineUploader);
        if (widget.options.sortable) {
           setTimeout(function() {widget._initsortable();}); 
        };

        $('#footer button:first').attr('save-img', widget.options.managerId);
        
    },

    _initsortable:function(){
        var widget = this;
        var galleryid = document.getElementById(widget.options.galleryid+'-gallery-ul');
        Sortable.create(galleryid, { 
            group: widget.options.galleryid+"-gallery",
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

    _initfineUploader:function(_initfineUploaderElement){
        var widget = this;
     
        _initfineUploaderElement.fineUploader({
            template: 'qq-template-gallery',
            // debug: true,
            multiple: false,
            request: {
                endpoint: '/async/basic.fileupload'
            },
            
            validation: {
                allowedExtensions: ['jpeg', 'jpg', 'gif', 'png']
            }
        }).on('error', function (event, id, name, reason) {
        }).on('complete', function (event, id, name, responseJSON) {
            var fileName = responseJSON.data.filename;
            var dirname = responseJSON.data.dirname;
            widget._setgalleryimg([fileName,dirname], widget.options.mainImgDir);
        });
        

    },
    
    _setgalleryimg:function(_fileNameArr, _maindir){
        var widget = this;
        var uploaddirobj = widget.options.uploadimgdirobj;
        
        sendRequest({
            action: 'basic.setgalleryimg',
            data: {filename: _fileNameArr,settings:uploaddirobj, maindir:_maindir},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var answer = response.data.answer;
                    var img = answer.uploadimg;
                    widget._addimgtobd(img);
                }
            }
        });

    },

    _addimgtobd:function(_file){
        var widget = this;
        var data = widget.options.addimgtobdData;
        data.file = _file;
        sendRequest({
        
            action: widget.options.addimgtobdAction,
            data: data,

            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.refreshcontent();
                }
            }
        });

    },

    _deleteimg: function (_id) {
        var widget = this;
        var data = widget.options.deleteImgData;
        data.itemid = _id;
        sendRequest({
            action: widget.options.deleteImgAction,
            data: data,
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.refreshcontent();
                }
            }
        });
    },
        
    _deleteimagefromserver:function(_imgid){
        var widget = this;
        var uploadimgdirobj = widget.options.uploadimgdirobj;
        var imgsrc = $('#'+widget.options.galleryid+'-gallery').find('li[data-id='+_imgid+']').find('div.gallery-thumbnail-contailer').attr('data-imgsrc');
        var data = [];
        var pos = imgsrc.lastIndexOf('/');
        imgsrc = imgsrc.substr(pos+1);
        
        for (var key in uploadimgdirobj) {
            var address = uploadimgdirobj[key].address;
            data.push(address+imgsrc);    
        };
        data.push('uploads/'+widget.options.mainImgDir+'/original/'+imgsrc); 
        data = JSON.stringify(data);
        sendRequest({
            action: 'basic.deleteimagefromserver',
            data: {data:data},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                
            }
        });
    },
    
    _savegalleryitems:function(){//native
        var widget = this;
        var data = widget.options.saveGalleryItemsData;
        var galleryobj = {};
        var gallerylistorder = $('#'+widget.options.galleryid+'-gallery').find('li.gallery-list');
        for (var i = 0; i < gallerylistorder.length; i++) {
            var li = gallerylistorder[i];
            var itemid = li.getAttribute('data-id');
            var inputEl = li.querySelectorAll('input.form-control');
            galleryobj[itemid] = {};
            var galleryObjItemId = {};
            for (var j = 0; j < inputEl.length; j++) {
                var value = inputEl[j].value;
                var inputTableField = inputEl[j].getAttribute('data-table-field');
                galleryObjItemId[inputTableField] = value;

            }

            for (var k in galleryObjItemId) {
                galleryobj[itemid][k] = galleryObjItemId[k];  
            };
            galleryobj[itemid]['order_num'] = i;
                        
        };

        data.data = galleryobj;
        
        sendRequest({
            action: widget.options.saveGalleryItemsAction,
            data: data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                   // widget.fnAfterSaveGalleryItems();
                   widget.refreshcontent();
                }
            }
        });
     
    },

    destroy: function() {
        this.element.remove();
        $.Widget.prototype.destroy.call(this);
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
