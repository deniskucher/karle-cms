/**
* Videos Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.05.22
*/
$.widget('nm.videosmanager', {

    options: {
        dummy: 'dummy',
        
        manager:null,
        photoTime: 0.0,
        photoAction:'',
        playerCurrentPosition:0.0,
        playerCurrentVideoId: 0,
        player:{},
        numThumb:null,
        managerId:null,
        dragVideoEl:{},
        dragMoveV:false
    },
    

    _create: function () {
        var widget = this;
        
        widget.options.managerId = Math.floor(Math.random() * 1000);
        
        $('body').on('click', '.save-item[save-video='+widget.options.managerId+']', function() {
            widget._saveVideoGallery();
        });

        this.element.on('click','#'+widget.options.galleryid+'-gallery a.play-video-modal', function() {
            widget._createVideoInModal($(this).attr('video_id'));
        });

        this.element.on('touchstart click','#first_frame_button', function(e) {
            widget.options.player.currentTime = 0;
        });

        this.element.on('touchstart click','#prev_frame_button', function(e) {
            widget.options.player.currentTime -= 0.2;
        });

        this.element.on('touchstart click','#next_frame_button', function(e) {
            widget.options.player.currentTime += 0.2;
        });

        this.element.on('touchstart click','#last_frame_button', function(e) {
            widget.options.player.currentTime = widget.options.player.duration;
        });

        this.element.on('touchstart click', '#'+widget.options.galleryid+'-gallery'+' button.delete-item', function() {
            if(confirm(widget.options.dict.removevideo+'?')){
                var videoId = $(this).attr('video_id');
                widget._deleteVideoBd(videoId);
                widget._deleteVideoServer(videoId);
            }
            else{
                e.preventDefault();
            }

        });
        
        this.element.on('click', '#'+widget.options.galleryid+'-gallery'+' button.delete-queue', function() {
            if(confirm(widget.options.dict.removevideo+'?')){
                var videoId = $(this).attr('video_id');
                widget._deleteVideoBd(videoId);
                widget._deleteVideoServer(videoId);
            }
            else{
                e.preventDefault();
            }

        });

        this.element.on('touchstart click','#change_thumb', function() {
            if (widget.options.player.paused) {
                widget.options.playerCurrentPosition = widget.options.player.currentTime;
                if (widget.options.playerCurrentPosition) {
                    widget.options.photoTime = widget.options.playerCurrentPosition;
                    widget.options.photoAction = 'change_thumb';
                    widget._loadFrames();
                }
                return false;
            }else{
                widget._showMessage('Video should be stopped!');
            }
            
        });

        this.element.on('touchstart click','#create_screenshot', function() {
            if (widget.options.player.paused) {
                widget.options.playerCurrentPosition = widget.options.player.currentTime;
                if (widget.options.playerCurrentPosition) {
                    widget.options.photoTime = widget.options.playerCurrentPosition;
                    widget.options.photoAction = 'create_photo';
                    widget._loadFrames();
                }
                return false;
            }else{
                widget._showMessage('Video should be stopped!');
            }
            
        });
        
        this.element.on('click', '.video-frame', function() {
            widget.options.numThumb = $(this).attr('num');
        });

        this.element.on('click','#blueimp-gallery img.slide-content, button.select-thumb', function(e){
            e.preventDefault();
            e.stopPropagation();
            var frame = $(this).closest('a.col-inner').attr('num');
            if(!frame) frame = widget.options.numThumb;
            if (widget.options.playerCurrentPosition) {
                $('div#video_buttons').hide();
                $('div#thumbnails_list').hide();
                $('div#video_loading').show();
                if (widget.options.photoAction == 'change_thumb') {
                    widget._changeThumb(frame);
                    
                } else if (widget.options.photoAction == 'create_photo') {
                    widget._createPhoto(frame);
                    
                }
            }
            $('#blueimp-gallery').css('display','none');
           
        });

        this.element.on('touchstart click','#player-field', function(e){
            e.preventDefault();
            e.stopPropagation();
            // setTimeout(function(){
                if (widget.options.player.paused) {
                    widget.options.playerCurrentPosition = widget.options.player.currentTime;
                    $('div#video_buttons').hide();
                    $('div#thumbnails_list').hide();
                    $('div#video_loading').hide();
                    widget.options.player.play();
                    
                }else{
                    
                    $('div#video_buttons').show();
                    $('div#video_loading').hide();
                    widget.options.player.pause();
                }
            // }); 
            
            
        });

        this.element.on('touchstart click','#video-modal button.close', function(e){
            e.preventDefault();
            e.stopPropagation();
            widget.options.player.pause();
        });

        this.element.on('mousedown dragstart touchstart touchmove', '.gallery-list', function(e) {
            widget.options.dragVideoEl = $(this);//.closest('.gallery-list');
            setTimeout(function() {
                widget.options.dragMoveV = true;
                if (widget.options.dragMoveV) {
                    widget.options.dragVideoEl.attr('draggable',true);
                    widget.options.dragVideoEl.addClass('selected-gallery-el');    
                };
                
            },200);
            
        });
        
        this.element.on('dragend touchend', '.gallery-list', function(e) {
            if (widget.options.dragMoveV) {
                widget.options.dragMoveV = false;
                $('li.gallery-list').removeClass('selected-gallery-el'); 
                $('gallery-thumbnail-contailer').removeAttr('draggable'); 
            };
            
        });

        $('body').on('mouseup touchend', function(e) {
            widget.options.dragMove = false;
            $('li.gallery-list').removeClass('selected-gallery-el'); 
        });
        
        this._refresh();
        
    },

    _refresh:function(){
        var widget = this;
        
        widget._createGalleryBlock();
        widget.refreshContent();
        
        widget._changeConvertedBoxState();
        widget._createModal();
        widget._addBlueimpGallery();
        
        setInterval(widget._updateConverted, 10000, widget);

    },

    refreshContent: function(){
        var widget = this;
        widget.options.widget = widget;
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
                    var videos = response.data.videos;
                    widget.displayThumbsContent(videos, gallerydata);
                    
                }
            }
            
        });
        
    },

    displayThumbsContent:function(_thumbsContentObj,_gallerydataObj){
        var widget = this;
        var images = _thumbsContentObj
        var gallerydata = _gallerydataObj;
        for (var i = 0; i < images.length; i++) {
            var item = images[i]
            if (item.status == 'ready') {
                gallerydata.append(
                    $thumbcontainer = $('<li/>',{class:'gallery-list col-lg-2 col-md-3 col-sm-3 col-xs-6'}).attr({'video_id':item.id, 'draggable':true}).append(
                        widget.options.thumbContainer
                    )
                )
                $thumbcontainer.find('button.delete-item').attr('video_id',item.id);
                $thumbcontainer.find('a.play-video-modal').attr({'video_id':item.id,'data-toggle':'modal','data-target':'#video-modal','href':'#'});
                $thumbcontainer.find('.gallery-thumbnail-contailer').addClass('sortable-gallery')
                .css('background','url(/uploads/videos_v2/'+item.domainId+'/'+item.horse_id+'/'+item.id+'/thumb.jpg)')
                .attr({'data-videosrc':'/uploads/videos_v2/'+item.domainId+'/'+item.horse_id+'/'+item.id+'/admin.flv'});
                
                if (!widget.options.sortable) {
                    $thumbcontainer.removeClass('sortable-gallery');
                    $thumbcontainer.removeAttr('draggable');
                };

                var labelEl = $thumbcontainer.find('form label');
                var inputEl = $thumbcontainer.find('input.form-control');
                for (var j = 0; j < labelEl.length; j++) {
                    var labelfor = labelEl[j].getAttribute('for');
                    labelEl[j].setAttribute('for',labelfor+item.id);
                }
                for (var q = 0; q < inputEl.length; q++) {
                    var inputid = inputEl[q].getAttribute('id');
                    var inputTableField = inputEl[q].getAttribute('data-table-field');
                    inputEl[q].setAttribute('id',inputid+item.id);
                    inputEl[q].value = item[inputTableField]; 
                }
            }
        };
        
        
    },

    _createGalleryBlock:function(){
        var widget = this;
        var el = widget.element;
        $('#'+widget.options.galleryid+'-gallery').remove();
        widget.element.prepend(
            widget.options.imgmanager = $('<div/>',{id:widget.options.galleryid+'-gallery'}).append(
                $('<div/>',{id:'uploader-gallery'}).append(
                    $fineUploader = $('<div/>',{id:'fine-uploader-gallery'})
                ),
                $('<div/>',{id:'queue-list'}).append(
                    $('<h2/>').text('Not converted yet'),
                    $('<ul/>',{id:'horse_queue_list'}),
                    $('<form/>',{id:'not_converted_form'})
                ),
                $('<div/>',{class:'gallery-video-block'}).append(
                    $('<ul/>', {class: 'gallery-data row', id:widget.options.galleryid+'-gallery-ul'}),
                    $('<div/>', {class:'ripple'})
                ) 
            )
            
        );
        widget._initFineUploader($fineUploader);
        if (widget.options.sortable) {
           setTimeout(function() {widget._initSortable();}); 
        };
        
        $('#footer button:first').attr('save-video', widget.options.managerId);
    },

    _initSortable:function(){
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

    _initFineUploader:function(_initfineUploaderElement){
        var widget = this;
        var horseId = widget.options.horseId;
        _initfineUploaderElement.fineUploader({
            template: 'qq-template-gallery',
            multiple: false,
            request: {
                endpoint: '/en/admin/horses/upload-video-files/id/'+horseId+'/encode_type/1',
                //endpoint: '/libs/fine-uploader/endpoint.php',
                inputName: 'Filedata',
                maxConnections: 1
            },
            validation: {
                allowedExtensions: ['m2ts','mts','mp4','flv','wmv','vob','mpg','mov','m4v','f4v','avi','webm','wlmp','3gp']
            }
        }).on('error', function (event, id, name, reason) {
            console.log(reason);
        }).on('complete', function (event, id, name, responseJSON) {
            // alert('file dowloaded!');
            console.log(responseJSON);
            var fileName = name;
            var videoId = responseJSON.videoId;
            widget._addImageV2(videoId);
            
        });
        

    },
    
    _addImageV2:function(videoId){
        var widget = this;
        var domainId = widget.options.domainId;
        var el = widget.element.find('#'+widget.options.galleryid+'-gallery #horse_queue_list').append(
            $('<li/>',{id:'queue_image_'+videoId}).append(
                $('<img/>',{src:'/uploads/videos_v2/'+domainId+'/'+widget.options.horseId+'/'+videoId+'/thumb.jpg'}),
                $('<div/>',{class:'btn-group btn-group-xs action-bar-video'}).append(
                    $('<button/>',{video_id:videoId, type:'button', class:'btn btn-default delete-queue', title:'Delete current video', alt:'Delete current video'}).append(
                        $('<span/>',{class:'glyphicon glyphicon-trash'})
                    )
                )
            )
        );
        widget.element.find('#'+widget.options.galleryid+'-gallery #not_converted_form').append(
            $('<input/>',{type:'hidden', name:'queue['+videoId+']',id:'queue_'+videoId})
        )
        widget._changeConvertedBoxState();
    },

    _changeConvertedBoxState:function() {
        var widget = this;
        var queueList = $('#'+widget.options.galleryid+'-gallery #horse_queue_list');
        if (queueList.children().length == 0) {
            queueList.closest('div$#queue-list').hide();
        } else {
            queueList.closest('div$#queue-list').show();
        }
    },

    _updateConverted:function(_widget){
        var widget = _widget;
        var horseId = widget.options.horseId;
        var horseQueueList = $('#'+widget.options.galleryid+'-gallery #horse_queue_list li');
        if (horseQueueList.length > 0) {
            sendRequest({
                action: 'basic.getqueuestatus',
                data: {horseid:horseId},
                
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    }
                    else{
                        var queueArr = response.data.queue;
                        
                        for (var i = 0; i < queueArr.length; i++) {
                            if(queueArr[i].status == 'ready'){
                                widget._markCompleted(queueArr[i]);
                            }else{
                                widget._markProcessing(queueArr[i]);
                            }

                        }
                        
                    }
                }
            });
        }    
    },

    _markProcessing:function(_videoObj){
        var widget = this;
        var videoId = _videoObj.id;
        var status = _videoObj.status;
        var statusText = '';
        switch (status) {
            case 'initializing':
                statusText = 'Initializing...';
                break;
            case 'waiting':
                statusText = 'Waiting...';
                break;
            case 'refresh':
                statusText = 'Refresh';
                break;
            default:
                statusText = 'Converting...';
        }        
        var currentVideoQueue = $('#queue_image_'+videoId);
        if (!currentVideoQueue.hasClass('processing-queue')) {
            currentVideoQueue.append(
                $('<div/>',{class:'queue-converting'}).append(
                    $('<span/>',{class:'status-queue'}).text(statusText)
                )
            );
            currentVideoQueue.addClass('processing-queue');
        }
        currentVideoQueue.find('span.status-queue').text(statusText);
        currentVideoQueue.find('img').css('opacity','0.7');

    },

    _markCompleted:function(_videoObj){
        var widget = this;
        var videoId = _videoObj.id;
        var queue_image = $('#queue_image_'+videoId).remove();
        var queue = $('#queue_'+videoId).remove();
        widget._changeConvertedBoxState();
        widget.refreshContent();
    },
    
    
    _deleteVideoBd: function (_id) {
        var widget = this;
        var data = widget.options.deleteVideoData;
        data.itemid = _id;
        sendRequest({
            action: widget.options.deleteVideoAction,
            data: data,
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.refreshContent();
                }
            }
        });
    },
        
    _deleteVideoServer:function(_id){
        var widget = this;
        
        sendRequest({
            action: 'basic.deletehorsevideoserver',
            data: {dir:'uploads/videos_v2/'+widget.options.domainId+'/'+widget.options.horseId+'/'+_id+'/'},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    $('#queue_image_'+_id).remove();
                    $('#queue_'+_id).remove();
                }
                
            }
        });
    },

    _loadFrames:function() {
        var widget = this;
        $('div#video_buttons').hide();
        $('div#video_loading').show();
        var playerCurrentVideoId = widget.options.playerCurrentVideoId;
        var time = widget.options.playerCurrentPosition;
        sendRequest({
            action: 'basic.createthumbs',
            data: {horseid:widget.options.horseId, videoid:playerCurrentVideoId,time:time},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    // var answer = response.data;
                    var list = response.data.list;
                    
                    var thumbnailsList = $('div#thumbnails_list').empty();
                    for (var i = 0; i < list.length; i++) {
                        thumbnailsList.append(
                            $('<div/>',{class:'col col-lg-3 col-md-4 col-sm-6 col-xs-6'}).append(
                                $('<a/>',{class:'col-inner video-frame', href:'/uploads/videos_v2/temp/'+list[i], num:i+1}).attr({'data-gallery':'','title':'Click on image to make thumb'}).append(
                                    $('<div/>',{class:'video-thumbnail-contailer'}).css('background-image','url(/uploads/videos_v2/temp/'+list[i]+')').append(
                                        $('<div/>',{class:'btn-group btn-group-xs action-bar-image'}).append(
                                            $('<button/>',{class:'btn btn-default select-thumb', type:'button', title:'Click to change thumb', alt:'Click to change thumb'}).append(
                                                $('<span/>',{class:'glyphicon glyphicon-ok'})
                                            )
                                        )
                                    )
                                )
                            )
                            
                        )
                    }
                    $('div#video_loading').hide();
                    $('div#thumbnails_list').show();
                    $('div#video_buttons').show();
                }
                
            }
        });

    },

    _changeThumb:function(_frame){
        var widget = this;
        var videoId = widget.options.playerCurrentVideoId;
        var time = widget.options.playerCurrentPosition;

        sendRequest({
            action: 'basic.changecover',
            data: {horseid:widget.options.horseId, videoid:videoId,time:time, frame:_frame},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    var answer = response.data;
                    
                    $('div#video_buttons').show();
                    $('div#video_loading').hide();
                    // widget.refreshContent();
                    var src = '/uploads/videos_v2/'+widget.options.domainId+'/'+widget.options.horseId+'/'+videoId+'/thumb.jpg?'+Math.random();
                    var li = $('#'+widget.options.galleryid+'-gallery li.gallery-list a[video_id='+videoId+']').find('.gallery-thumbnail-contailer').css('background', 'url("'+src+'") repeat scroll 0% 0%');
                    widget._showMessage('Thumbnail changed');
                }
                
            }
        });
    },
    
    _createPhoto:function(_frame){
        var widget = this;
        
        sendRequest({
            action: 'basic.createphotofromvideo',
            data: {horseid:widget.options.horseId, videoid:widget.options.playerCurrentVideoId,time:widget.options.photoTime,frame:_frame},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    var file = response.data.filename;
                    $('div#video_buttons').show();
                    $('div#video_loading').hide();
                    widget._addImgToBd(file);
                    widget._showMessage('New photo created');
                    
                }
                
            }
        });
    },
    
    _showMessage:function(message) {
        $('div#message_cover_box').show();
        $('div#video_message_box').html(message);
        $('div#video_message_box').fadeIn(300).delay(1500).fadeOut(400);
    },

    _saveVideoGallery:function(){//native
        var widget = this;
        var data = widget.options.saveGalleryItemsData;
        var galleryobj = {};
        var gallerylistorder = $('#'+widget.options.galleryid+'-gallery').find('li.gallery-list');
        for (var i = 0; i < gallerylistorder.length; i++) {
            var li = gallerylistorder[i];
            var itemid = li.getAttribute('video_id');
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
            galleryobj[itemid]['order'] = i;
                        
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
                   widget.refreshContent();
                }
            }
        });
     
    },
    
    _createModal:function(){
        var widget = this;
        widget.element.append(
            $('<div/>',{id:'video-modal', class:'modal'}).append(
                $('<div/>',{class:'modal-dialog modal-lg'}).append(
                    $('<div/>',{class:'modal-content'}).append(
                        $('<div/>',{class:'modal-header'}).append(
                            $('<button/>',{class:'close', type:'button'}).attr({'data-dismiss':'modal','aria-hidden':'true','aria-label':'Close'}).append(
                                $('<span/>').attr('aria-hidden','true').text('×')
                            ),
                            $('<h3/>',{class:'modal-header-text'}).text('Video manager')
                        ),
                        $('<div/>',{class:'modal-body'}),
                        $('<div/>',{class:'modal-footer'})
                    )
                )
            )
        );
    },

    _createVideoInModal:function(_videoId){
        var widget = this;
        var videoModal = $('#video-modal');
        widget.options.playerCurrentVideoId = _videoId;
        var modalBody = videoModal.find('.modal-body').empty();
        videoModal.find('.modal-footer').empty();
        modalBody.append(
            $('<div/>',{id:'player-field'}).append(
               $('<video/>',{id:'videoplayer', autoplay:'autoplay', controls:'controls', poster:'/uploads/videos_v2/'+widget.options.domainId+'/'+widget.options.horseId+'/'+_videoId+'/thumb.jpg'}).append(
                $('<source>',{src:'/uploads/videos_v2/'+widget.options.domainId+'/'+widget.options.horseId+'/'+_videoId+'/original.mp4', type:'video/mp4'}),
                $('<source>',{src:'/uploads/videos_v2/'+widget.options.domainId+'/'+widget.options.horseId+'/'+_videoId+'/original.flv', type:'rtmp/flv'})
                ) 
            ),
            $('<div/>',{id:'video_buttons', videoid:_videoId}).css({'margin-top':'20px','text-align':'center', 'display':'none'}).append(
                $('<button/>',{type:'button',id:'create_screenshot', class:'btn btn-warning'}).text('Create screenshot'),
                $('<button/>',{type:'button',id:'change_thumb', class:'btn btn-success'}).text('Change thumb'),
                $('<button/>',{type:'button',id:'first_frame_button', class:'btn btn-primary'}).text('<<'),
                $('<button/>',{type:'button',id:'prev_frame_button', class:'btn btn-primary'}).text('<'),
                $('<button/>',{type:'button',id:'next_frame_button', class:'btn btn-primary'}).text('>'),
                $('<button/>',{type:'button',id:'last_frame_button', class:'btn btn-primary'}).text('>>')
            ),
            $('<div/>',{id:'video_loading'}).css({'margin-top':'20px','text-align':'center','display':'none'}).append(
                $('<img/>',{src:'/img/admin/activity.gif'})
            )
        );
        videoModal.find('.modal-footer').append(
            $('<div/>',{id:'thumbnails_list'}),
            $('<div/>',{id:'message_cover_box', class:'at-nl'}).css('margin-top','10px').append(
                $('<div/>',{class:'at-warning-box',id:'video_message_box'}).css('display','none')
            )
        );
        
        widget.options.player = $('#videoplayer')[0];
        
    },

    _addImgToBd:function(_file){
        var widget = this;
        sendRequest({
        
            action: 'basic.addhorsesimgtobd',
            data: {file: _file, horseid:widget.options.horseId},

            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }else{
                    var horsePhotoArr = response.data.horsephoto;

                    var fish = $('#horses-gallery-ul li.gallery-list:first').find('.thumb-box')[0];
                    if (!fish) fish = widget.options.thumbContainerUpdateImg;
                    $('#horses-gallery-ul').append(
                        $thumbcontainer = $('<li/>',{class:'gallery-list col-lg-2 col-md-3 col-sm-3 col-xs-6'}).attr({'data-id':horsePhotoArr.id}).append(
                            widget.options.thumbContainerUpdateImg
                        )
                    );
                    if (horsePhotoArr['main_image']) $thumbcontainer.addClass('main-image').find('span.glyphicon-star-empty').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
                    $thumbcontainer.find('.gallery-thumbnail-contailer').css('background','url(/uploads/photos/thumbs/'+horsePhotoArr.filename+')').attr('data-imgsrc','/uploads/photos/thumbs/'+horsePhotoArr.filename);    
                    
                    var labelEl = $thumbcontainer.find('form label');
                    var inputEl = $thumbcontainer.find('input.form-control');
                    for (var j = 0; j < labelEl.length; j++) {
                        var labelfor = labelEl[j].getAttribute('for');
                        labelEl[j].setAttribute('for',labelfor+horsePhotoArr.id);
                    }
                    for (var q = 0; q < inputEl.length; q++) {
                        var inputid = inputEl[q].getAttribute('id');
                        var inputTableField = inputEl[q].getAttribute('data-table-field');
                        inputEl[q].setAttribute('id',inputid+horsePhotoArr.id);
                        inputEl[q].value = horsePhotoArr[inputTableField]; 
                    }
                    
                }
                
            }
        });

    },
    
    _addBlueimpGallery:function(){
        var widget = this;
        var blueimp = $('head script[src*=blueimp-gallery]').remove();
        var videosmanager = $('body script[src*=videosmanager]');
        videosmanager.after($('<script>',{src:'/plugins/blueimp-gallery/js/jquery.blueimp-gallery.js', type:'text/javascript'}));
        widget.element.append(
            $('<div/>',{id:'blueimp-gallery', class:'blueimp-gallery blueimp-gallery-controls'}).attr('data-use-bootstrap-modal','false').append(
                $('<div/>',{class:'slides'}),
                $('<h3/>',{class:'title'}),
                $('<p/>',{class:'description'}),
                $('<a/>',{class:'prev'}).text('‹'),
                $('<a/>',{class:'next'}).text('›'),
                $('<a/>',{class:'close'}).text('×'),
                $('<a/>',{class:'play-pause'}),
                $('<ol/>',{class:'indicator'})
            )
        );
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
