/**
* Settings Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.17
*/
$.widget('nm.settingsmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'settings',
        tableId:'settings',
        
        refreshTableHandler:'basic.getsettings',
        
        newsSourceElement:{'Website news':'news','Twitter':'twitter'},
        recentlyUpdatedElement:{'1':'1 day', '3':'4 days','7':'1 week','14':'2 weeks','31':'1 month','92':'3 months','183':'6 months','365':'1 year'},
        recentlyUpdatedLimitElement:['0','1','2','3','4','5','6','7','8','9','10','12','15','20','25'],
        wysiwygHtmlEditorElement:{'tinymce2':'TinyMCE 2','tinymce4':'TinyMCE 4','advanced':'Advanced'},
        horsesViewModeElement:['list','gallery'],
        fbPageSwitchElement:['personal','company'],
        sliderImagesSourceElement:['slider','gallery','horses'],
        customSettingsAttribute:{},
        settingsObj:{},
        tinymceId:[],
        tinyGalleryId:null
    },
    
    _create: function () {
        var widget = this;
        // localStorage.removeItem('tinymceid');
        widget.removeTinymce(widget.options.tinymceId);
        widget.options.tinyGalleryId = Math.floor(Math.random() * 100);

        this.element.on('click','div#settingsform .save-settings', function() {
            $('#settingsform').find('.has-error').removeClass('has-error');
            widget.updateItemSelf();
        });

        this.element.on('click','div#addoptionform .senddataonserver', function() {
            widget.createCustomSettings();
        });

        this.element.on('click','div#addoptionform button.cancel-add', function(){
            $('div#addoptionform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div#settingsform').removeClass('itemsform-hidden').addClass('itemsform-visible');
            $('div#addoptionform').find('span.error-form').text('');
        });

        this.element.on('click','div#settingsform .add-option', function() {
            widget.addOptionForm();
            $('div#settingsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div#addoptionform').removeClass('itemsform-hidden').addClass('itemsform-visible');
        });

        this.element.on('focus', 'div#settingsform .modal-body input[type=text], div#addoptionform .modal-body input[type=text]', function() {
            $(this).next().hide();
            
        });
        
        this.element.on('blur', 'div#settingsform .modal-body input[type=text], div#addoptionform .modal-body input[type=text]', function() {
            if ($(this).val()=='') $(this).next().show();
        });

        this.element.on('keypress', 'input.form-control', function (e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.element.on('click', 'div.customsettingsblock button.delete-opt', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if(confirm(widget.options.dict.remove+' '+widget.options.dict.option+'?')){
                widget.options.tableName = 'custom_settings';
                widget.deleteItem($(this).data('id'));
                widget.options.tableName = 'settings';
            }
            else{
                e.preventDefault();
            }
        });

    //=================== Event of addimg files/photos =====START======================= 
        this.element.on('click','div.mce-widget[aria-label=Gallery]', function(){
            widget.options.currentEditorId = $(this).parents('.mce-tinymce').next('textarea').attr('id');
        });
        
        $('body').on('touchstart  click', '.tinygallery-container-'+widget.options.tinyGalleryId+' .gallery-thumbnail-contailer', function() {
            tinyMCE.get(widget.options.currentEditorId).selection.setContent('<img src="'+$(this).attr('data-imgsrc')+'" />');
            $( "#gallery-dialog" ).dialog('close');
            return false;
        });

    //====================== Event of addimg files/photos ---END ========================== 

        this.refreshTable();
    },
	
	refreshTable: function (_afterupdate) {
        var widget = this;
        var tinymceId = localStorage.getItem('tinymceid');
        tinymceId = JSON.parse(tinymceId);
        if (tinymceId) widget.removeTinymce(tinymceId);
        var afterUpdate = _afterupdate;
        sendRequest({
            action: widget.options.refreshTableHandler,
            data: {tablename: widget.options.tableName},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success){
                    $('table#'+widget.options.tableId+'>tbody').remove();
                    $('#'+widget.options.tableId+'-navigation').remove();
                    $('<div/>', {class: 'usernotfound'}).append(
                        $('<p/>').text(widget.options.dict.datadontfound)
                    ).insertAfter('table#'+widget.options.tableId);
                } 
                else {
                    var data = response.data;
                    widget.options.items = data.settingsobj;
                    widget.options.customSettings = data.customsettings;
                }
                widget.createItemsForm(afterUpdate);
                widget._initTinymce();

            }
        });
    
    },
    
    clearAddOptionForm:function(){
        var widget = this;
        $('#addoptionform').find('.customoption').val('');
        $('#addoptionform').find('.has-error').removeClass('has-error');
    },
    
    addOptionForm:function(){
        var widget = this;
        if ($('#addoptionform').length == 0) {
            $('div.card').append(
                $('<div/>', {class:'itemsform-hidden', id:'addoptionform'}).append(
                    $('<div/>',{class:'itemsform-dialog'}).append(
                        $('<div/>',{class:'itemsform-content'}).append(
                            $('<div/>',{class:'modal-header'}).append(
                                $('<h4/>', {class:'modal-title'}).text(widget.options.dict.add_new+' '+widget.options.dict.custom+' '+widget.options.dict.option)
                            ),
                            $('<div/>',{class:'modal-body'}).append(
                                $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-label_de').text(widget.options.dict.german+' '+widget.options.dict.label),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control customoption', type:'text', id:'input-label_de'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.german+' '+widget.options.dict.label),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-label_en').text(widget.options.dict.english+' '+widget.options.dict.label),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control customoption', type:'text', id:'input-label_en'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.english+' '+widget.options.dict.label),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-key').text(widget.options.dict.key),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control customoption', type:'text', id:'input-key'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.key),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-input_type').text(widget.options.dict.input+' '+widget.options.dict.type),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<select/>',{class:'form-control customoption', id:'input-input_type'}).append(
                                                $('<option/>').text('text').val('text'),
                                                $('<option/>').text('textarea').val('textarea'),
                                                $('<option/>').text('html').val('html')
                                            ),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-ml').text(widget.options.dict.multilingual),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<select/>',{class:'form-control customoption', id:'input-ml'}).append(
                                                $('<option/>').text('No').val(0),
                                                $('<option/>').text('Yes').val(1)
                                            ),
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
            );
           
            widget.customSettingsSaved();
            
        }
    },

    createItemsForm:function(_afterupdate){
        var widget = this;
        var items = widget.options.items;
        var customSettings = widget.options.customSettings;
        for (var i = 0; i < items.length; i++) {
            widget.options.settingsObj[items[i].name] = items[i]; 
        };
        var settingsObj = widget.options.settingsObj;
        $('#'+widget.options.tableId+'form').remove();
        // if ($('#'+widget.options.tableid+'form').length == 0) {
            // widget.element.find('div.card').empty();
            // $('div.card').append(
                $('<div/>', {class:'additemsform itemsform-visible', id:widget.options.tableId+'form'}).append(
                    $('<div/>',{class:'itemsform-dialog'}).append(
                        $('<div/>',{class:'itemsform-content'}).append(
                            $('<div/>',{class:'modal-header'}).append(
                                $('<h4/>', {class:'modal-title'}).text(widget.options.dict.edit+' '+widget.options.dict.settings)
                            ),
                            $('<div/>',{class:'modal-body'}).append(
                                $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                    $('<div/>',{class:'row'}).append(
                                        $('<div/>',{class:'col-sm-6'}).append(
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.title_de.name).text(widget.options.dict.german_site_title),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.title_de.name,'data-id':settingsObj.title_de.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.german_site_title).val(settingsObj.title_de.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.title_en.name).text(widget.options.dict.english_site_title),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.title_en.name,'data-id':settingsObj.title_en.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.english_site_title).val(settingsObj.title_en.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.news_source.name).text(widget.options.dict.news_source),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.news_source.name,'data-id':settingsObj.news_source.id}),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.twitter_id.name).text('Twitter ID'),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.twitter_id.name,'data-id':settingsObj.twitter_id.id})
                                                        .attr('placeholder', widget.options.dict.input+' Twitter ID').val(settingsObj.twitter_id.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.google_analytics.name).text('Google Analytics ID'),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.google_analytics.name,'data-id':settingsObj.google_analytics.id})
                                                        .attr('placeholder', widget.options.dict.input+' Google Analytics ID').val(settingsObj.google_analytics.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.watermark.name).text(widget.options.dict.watermark_text),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.watermark.name,'data-id':settingsObj.watermark.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.watermark_text).val(settingsObj.watermark.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.recently_updated_period.name).text(widget.options.dict.recently_updated),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.recently_updated_period.name,'data-id':settingsObj.recently_updated_period.id}),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.recently_updated_limit.name).text(widget.options.dict.recently_updated_limit),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.recently_updated_limit.name,'data-id':settingsObj.recently_updated_limit.id}),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.refine_expanded.name).text(widget.options.dict.refine_search_expanded),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.refine_expanded.name,'data-id':settingsObj.refine_expanded.id}).append(
                                                            $('<option/>').text(widget.options.dict.no).val('n'),
                                                            $('<option/>').text(widget.options.dict.yes).val('y')
                                                        ),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.wysiwyg_html_editor.name).text(settingsObj.wysiwyg_html_editor.description),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.wysiwyg_html_editor.name,'data-id':settingsObj.wysiwyg_html_editor.id}),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            )
                                        ),
                                        $('<div/>',{class:'col-sm-6'}).append(
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.horse_thumb_width.name).text(widget.options.dict.horse_thumbnail_width),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.horse_thumb_width.name,'data-id':settingsObj.horse_thumb_width.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.horse_thumbnail_width).val(settingsObj.horse_thumb_width.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.horse_thumb_height.name).text(widget.options.dict.horse_thumbnail_height),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.horse_thumb_height.name,'data-id':settingsObj.horse_thumb_height.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.horse_thumbnail_height).val(settingsObj.horse_thumb_height.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.horse_preview_width.name).text(widget.options.dict.horse_preview_width),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.horse_preview_width.name,'data-id':settingsObj.horse_preview_width.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.horse_preview_width).val(settingsObj.horse_preview_width.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.horse_preview_height.name).text(widget.options.dict.horse_preview_height),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.horse_preview_height.name,'data-id':settingsObj.horse_preview_height.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.horse_preview_height).val(settingsObj.horse_preview_height.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.horses_view_mode.name).text(settingsObj.horses_view_mode.description),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.horses_view_mode.name,'data-id':settingsObj.horses_view_mode.id}).append(
                                                            $('<option/>').text(widget.options.dict.list).val('list'),
                                                            $('<option/>').text(widget.options.dict.gallery).val('gallery')
                                                        ) ,
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(   
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.send_to_fb_default.name).text(settingsObj.send_to_fb_default.description),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.send_to_fb_default.name,'data-id':settingsObj.send_to_fb_default.id}).append(
                                                            $('<option/>').text(widget.options.dict.no).val('no'),
                                                            $('<option/>').text(widget.options.dict.yes).val('yes')
                                                        ) ,
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.fb_page_switch.name).text(widget.options.dict.facebook_page_switch),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.fb_page_switch.name,'data-id':settingsObj.fb_page_switch.id}).append(
                                                            $('<option/>').text(widget.options.dict.personal).val('personal'),
                                                            $('<option/>').text(widget.options.dict.company).val('company')
                                                        ) ,
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12'}).append(
                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.fb_cp_id.name).text(widget.options.dict.facebook_company_page_id),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<input/>',{class:'form-control settings', type:'text', id:'input-'+settingsObj.fb_cp_id.name,'data-id':settingsObj.fb_cp_id.id})
                                                        .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.facebook_company_page_id).val(settingsObj.fb_cp_id.value),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            ),
                                            $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12 last-option'}).append(
                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                    $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','input-'+settingsObj.slider_images_source.name).text(widget.options.dict.slider_images_source),
                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                        $('<select/>',{class:'form-control settings', id:'input-'+settingsObj.slider_images_source.name,'data-id':settingsObj.slider_images_source.id}),
                                                        $('<span/>',{class:'error-form'})
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        $('<div/>', {class:'modal-footer col-xs-11', id:'footer'}).append(
                            $('<button/>', {class: 'btn btn-primary save-settings', type:'submit', title:widget.options.dict.save+' '+widget.options.dict.settings}).text(widget.options.dict.save),
                            $('<button/>', {class: 'btn btn-success add-option', type:'button', title:widget.options.dict.add_new+' '+widget.options.dict.option}).text('+')
                        )
                    )
                ).appendTo($('div.card'));
            // );
            var inputNewsSource = $('select#input-news_source');
            for(key in widget.options.newsSourceElement){
                inputNewsSource.append(
                    $opt = $('<option/>').text(key).val(widget.options.newsSourceElement[key])
                );
                if (settingsObj.news_source.value == widget.options.newsSourceElement[key]) $opt.attr('selected','selected');
            };
            
            var inputRecentlyUpd = $('select#input-recently_updated_period');
            for(key1 in widget.options.recentlyUpdatedElement){
                inputRecentlyUpd.append(
                    $opt1 = $('<option/>').text(widget.options.recentlyUpdatedElement[key1]).val(key1)
                );
                if (settingsObj.recently_updated_period.value == key1) $opt1.attr('selected','selected');
            };
            
            var inputRecentlyUpdLimit = $('select#input-recently_updated_limit');
            var recUpdLimElem = widget.options.recentlyUpdatedLimitElement;
            for (var j = 0; j < recUpdLimElem.length; j++) {
                inputRecentlyUpdLimit.append(
                    $opt2 = $('<option/>').text(recUpdLimElem[j]).val(recUpdLimElem[j])
                );
                if (settingsObj.recently_updated_limit.value == recUpdLimElem[j]) $opt2.attr('selected','selected');
            };

            var inputRefineSearchExp = $('select#input-refine_expanded option[value='+settingsObj.refine_expanded.value+']').attr('selected','selected');
            
            var inputHtmlEditor = $('select#input-wysiwyg_html_editor');
            for(key2 in widget.options.wysiwygHtmlEditorElement){
                inputHtmlEditor.append(
                    $opt2 = $('<option/>').text(widget.options.wysiwygHtmlEditorElement[key2]).val(key2)
                );
                if (settingsObj.wysiwyg_html_editor.value == key2) $opt2.attr('selected','selected');
            };

            var inputHorsesViewMode = $('select#input-horses_view_mode option[value='+settingsObj.horses_view_mode.value+']').attr('selected','selected');
            var inputSendToFBDeflt = $('select#input-send_to_fb_default option[value='+settingsObj.send_to_fb_default.value+']').attr('selected','selected');
            var inputFBPageSwitch = $('select#input-fb_page_switch option[value='+settingsObj.fb_page_switch.value+']').attr('selected','selected');

            var inputSliderImgSource = $('select#input-slider_images_source');
            var sliderImagesSourceElement = widget.options.sliderImagesSourceElement;
            for (var k = 0; k < sliderImagesSourceElement.length; k++) {
                inputSliderImgSource.append(
                    $opt3 = $('<option/>').text(widget.options.dict[sliderImagesSourceElement[k]]).val(sliderImagesSourceElement[k])
                );
                if (settingsObj.slider_images_source.value == sliderImagesSourceElement[k]) $opt3.attr('selected','selected');
            };
            
            
            widget.successSaveMessage();
            
        // }// if ($('#'+widget.options.tableid+'form').length == 0)
        $('#'+widget.options.tableId+'form .customsettingsblock').remove();
        var lang = widget.options.lang;
        var lastOption = $('div.last-option').closest('div.row');
        lastOption.after($('<div/>',{class:'row customsettings-row'}));
        var label, value,inputLang;
        
        for (var q = customSettings.length-1; q >= 0; q--) {
            if (lang == 'en'){
                label =  customSettings[q].label_en;
                value =  customSettings[q].value_en;
                inputLang = 'inputen_';
            }else if(lang == 'de'){
                label =  customSettings[q].label_de;
                value =  customSettings[q].value_de;
                inputLang = 'inputde_';
            }
            $customSettingsBlocken = null;
            if (customSettings[q].ml == '1') {
                // lastoption.append(
                    $customSettingsBlock = $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12 customsettingsblock'}).attr({'data-id':customSettings[q].id,'data-multi':true,'data-lang':'de'}).append(
                        $('<div/>',{class:'form-group responsive-label de'}).append(
                            $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','inputde_'+customSettings[q].id).text(label+' ('+widget.options.dict.german_version+')'),
                            $('<div/>',{class:'col-xs-10 multiinput'}),
                            $('<div/>',{class:'col-xs-1'}).append(
                                $('<button/>',{class:'btn btn-default delete-opt', title:widget.options.dict.remove+' '+widget.options.dict.option, alt:widget.options.dict.remove+' '+widget.options.dict.option}).attr('data-id',customSettings[q].id).append(
                                    $('<span/>',{class:'glyphicon glyphicon-trash'})
                                )
                            )
                        )
                    ),
                    $customSettingsBlocken= $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12 customsettingsblock'}).attr({'data-id':customSettings[q].id,'data-multi':true,'data-lang':'en'}).append(
                        $('<div/>',{class:'form-group responsive-label en'}).append(
                            $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for','inputen_'+customSettings[q].id).text(label+' ('+widget.options.dict.english_version+')'),
                            $('<div/>',{class:'col-xs-10 multiinput'}),
                            $('<div/>',{class:'col-xs-1'}).append(
                                $('<button/>',{class:'btn btn-default delete-opt', title:widget.options.dict.remove+' '+widget.options.dict.option, alt:widget.options.dict.remove+' '+widget.options.dict.option}).attr('data-id',customSettings[q].id).append(
                                    $('<span/>',{class:'glyphicon glyphicon-trash'})
                                )
                            )
                        )
                    )
                    
                    $('div.customsettings-row').prepend(
                        $('<div/>',{class:'col-sm-6'}).append($customSettingsBlock),
                        $('<div/>',{class:'col-sm-6'}).append($customSettingsBlocken)
                    );
                    
                // );
                
            }else{
                // lastoption.append(
                    $customSettingsBlock = $('<div/>',{class:'col-md-offset-1 col-sm-10 col-xs-12 customsettingsblock'}).attr({'data-id':customSettings[q].id}).append(
                        $('<div/>',{class:'form-group responsive-label'}).append(
                            $('<label/>',{class:'control-label col-xs-12 align-left'}).attr('for',inputLang+customSettings[q].id).text(label),
                            $('<div/>',{class:'col-xs-10 custominput'}),
                            $('<div/>',{class:'col-xs-1'}).append(
                                $('<button/>',{class:'btn btn-default delete-opt', title:widget.options.dict.remove+' '+widget.options.dict.option, alt:widget.options.dict.remove+' '+widget.options.dict.option}).attr('data-id',customSettings[q].id).append(
                                    $('<span/>',{class:'glyphicon glyphicon-trash'})
                                )
                            )
                        )
                    )
                    
                    $('div.customsettings-row').append(
                        $('<div/>',{class:'col-sm-6'}).append($customSettingsBlock)
                    );
                    
                // )

            }
            
            if (customSettings[q].input_type == 'text') {
                
                $customSettingsBlock.find('.custominput').prepend(
                    $('<input/>',{class:'form-control customsettings', type:'text', id:inputLang+customSettings[q].id}).attr({'placeholder': widget.options.dict.input+' '+customSettings[q].label_en,'data-type':'text'}).val(value)
                );
                if ($customSettingsBlocken) {
                    $customSettingsBlocken.find('div.en .multiinput').prepend(
                        $('<input/>',{class:'form-control customsettings', type:'text', id:'inputen_'+customSettings[q].id}).attr({'placeholder': widget.options.dict.input+' '+customSettings[q].label_en,'data-type':'text'}).val(customSettings[q].value_en)
                    );
                };
                
                $customSettingsBlock.find('div.de .multiinput').prepend(
                    $('<input/>',{class:'form-control customsettings', type:'text', id:'inputde_'+customSettings[q].id}).attr({'placeholder': widget.options.dict.input+' '+customSettings[q].label_en,'data-type':'text'}).val(customSettings[q].value_de)
                );

            }else if((customSettings[q].input_type == 'textarea') || (customSettings[q].input_type == 'html')){
                $customSettingsBlock.find('.custominput').prepend(
                    $('<textarea/>',{class:'form-control customsettings', rows:'3', id:inputLang+customSettings[q].id}).attr({'placeholder': widget.options.dict.input+' '+customSettings[q].label_en, 'data-type':'textarea'}).val(value)
                );
                if ($customSettingsBlocken) {
                    $customSettingsBlocken.find('div.en .multiinput').prepend(
                        $('<textarea/>',{class:'form-control customsettings', rows:'3', id:'inputen_'+customSettings[q].id}).attr({'placeholder': widget.options.dict.input+' '+customSettings[q].label_en, 'data-type':'textarea'}).val(customSettings[q].value_en)
                    );
                };
                
                $customSettingsBlock.find('div.de .multiinput').prepend(
                    $('<textarea/>',{class:'form-control customsettings', rows:'3', id:'inputde_'+customSettings[q].id}).attr({'placeholder': widget.options.dict.input+' '+customSettings[q].label_en, 'data-type':'textarea'}).val(customSettings[q].value_de)
                );
            }
            if (customSettings[q].input_type == 'html') {
                var textareasId = $customSettingsBlock.find('textarea').attr('data-type','html').attr('id');
                widget.options.tinymceId.push(textareasId);
                if ($customSettingsBlocken) {
                    var textareasEnId = $customSettingsBlocken.find('textarea').attr('data-type','html').attr('id');
                    widget.options.tinymceId.push(textareasEnId);
                };
                
            }
        };
        var tinymceIdArr = JSON.stringify(widget.options.tinymceId);
        localStorage.setItem('tinymceid', tinymceIdArr);
        // widget._inittinymce();
        
        if (_afterupdate) {
            $successSaveMessage = $('#successsave');
            $successSaveMessage.show('slow');
            setTimeout(function() {
                $successSaveMessage.hide('slow');
            },3000);
        }
    },

    _initTinymce:function(){
        var widget = this;
        setTimeout(function() {widget.tinymceInit()},50);
    },

    createCustomSettings:function(){
        var widget = this;
        var settingsData = {};
        var settingsRequiredFields = {};
      
        var settingsObj = $('#addoptionform').find('.customoption');
        for (var i = 0; i < settingsObj.length; i++) {
            
            var settingsId = settingsObj[i].getAttribute('id').substring(6);
            var value = settingsObj[i].value;
            settingsData[settingsId] = value;
            settingsRequiredFields[settingsId] = {};
            var hasattrrequired = settingsObj[i].closest('div.form-group').classList.contains('required');
            (hasattrrequired)? settingsRequiredFields[settingsId].required = 'required': settingsRequiredFields[settingsId].required = 'notrequired';
            settingsRequiredFields[settingsId].erraddress = settingsId;
        };
        sendRequest({
            action: 'basic.createcustomsettings',
            data: {requiredfields:settingsRequiredFields, data:settingsData, tablename:'custom_settings'},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    var errors = JSON.parse(response.message);
                    widget.displayInvalidForm(errors, '#addoptionform');
                    if (errors['input-key'] == 'key_in_use') {
                        var form = $('#addoptionform');
                        form.find('input#input-key').next().text(widget.options.dict.keyinuse).show();
                        form.find('input#input-key').closest('div.form-group').addClass('has-error');
                    }
                }else{
                    widget.clearAddOptionForm();
                    $('div#addoptionform').removeClass('itemsform-visible').addClass('itemsform-hidden');
                    $('div#settingsform').removeClass('itemsform-hidden').addClass('itemsform-visible');
                    widget.refreshTable();
                    var message = $('#customsettingssaved');
                    message.show('slow');
                    setTimeout(function() {
                        message.hide('slow');
                    },3000);
                }
            }
        });

    },

    updateItemSelf: function(){
        var widget = this;
        $('.error-form').text('');
        var lang = widget.options.lang;
        var settingsData = {};
        var settingsRequiredFields = {};
        var form = $('#'+widget.options.tableId+'form');
        var settingsObj = form.find('.settings');
        for (var i = 0; i < settingsObj.length; i++) {
            
            var settingsId = settingsObj[i].getAttribute('id').substring(6);
            var value = settingsObj[i].value;
            settingsData[settingsId] = value;
            settingsRequiredFields[settingsId] = {};
            var hasAttrRequired = settingsObj[i].closest('div.form-group').classList.contains('required');
            (hasAttrRequired)? settingsRequiredFields[settingsId].required = 'required': settingsRequiredFields[settingsId].required = 'notrequired';
            settingsRequiredFields[settingsId].erraddress = settingsId;
        
        };
        var customSettingsData = {};
        
        var customSettingsObj = $('#'+widget.options.tableId+'form').find('.customsettingsblock');
        for (var j = 0; j < customSettingsObj.length; j++) {
            
            var customsetId =  customSettingsObj[j].getAttribute('data-id');
            if (!customSettingsData[customsetId]) {
                customSettingsData[customsetId] = {};
            }
            var inputField = customSettingsObj[j].querySelectorAll('.customsettings');
            var inputType = inputField[0].getAttribute('data-type');
            var dataLang = customSettingsObj[j].getAttribute('data-lang');
            
            if ((inputType == 'text')||(inputType == 'textarea')) {
                if (customSettingsObj[j].getAttribute('data-multi')) {
                    var customVal = customSettingsObj[j].querySelectorAll('#input'+dataLang+'_'+customsetId).value;
                    
                }else{
                    var customVal = customSettingsObj[j].querySelectorAll('#input'+lang+'_'+customsetId).value;
                    
                }
                
            }else if (inputType == 'html') {
                if (customSettingsObj[j].getAttribute('data-multi')) {
                    var customVal = tinyMCE.get('input'+dataLang+'_'+customsetId).getContent();
                    
                }else{
                    var customVal = tinyMCE.get('input'+lang+'_'+customsetId).getContent();
                    
                }
                
            };
            
            if ((dataLang) && (dataLang == 'en')){
                customSettingsData[customsetId].value_en = customVal;
            }
            else if((dataLang) && (dataLang == 'de')){
                customSettingsData[customsetId].value_de = customVal;
            }else if(lang == 'en'){
                customSettingsData[customsetId].value_en = customVal;   
            }else{
                customSettingsData[customsetId].value_de = customVal;
            }
                    
        };
        var data = {settingsrequiredfields:settingsRequiredFields, settingsdata:settingsData, customsettingsdata:customSettingsData};
        widget.updateItem(true, 'basic.updatesettings', data);
        
    },

    actionAfterUpdateItem:function(){
        var widget = this;
        widget.refreshTable(true);
    },

    successSaveMessage: function(){   
        var widget = this;
        if($('#successsave').length == 0)
        {   
            $('#settingsform form.form-horizontal').append(
                $('<div/>',{class:'row', id:'successsave'}).append(
                    $('<div/>',{class:'col-xs-12 at-nl'}).append(
                        $('<div/>',{class:'at-warning-box'}).text(widget.options.dict.settingssaved)
                    )
                )
            )
       }
    },

    customSettingsSaved: function(){   
        var widget = this;
        if($('#customsettingssaved').length == 0){   
            $('#settingsform form.form-horizontal').prepend(
                $('<div/>',{class:'row', id:'customsettingssaved'}).append(
                    $('<div/>',{class:'col-xs-12 at-nl'}).append(
                        $('<div/>',{class:'at-warning-box'}).text(widget.options.dict.customsettingssaved)
                    )
                )
            )
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
