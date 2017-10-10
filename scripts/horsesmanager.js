/**
* Horses Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.01
*/
$.widget('nm.horsesmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'horses',
        managerId:'horses',
        tableSettings:null,
        thobject:null,
        tdobject:null,
        thtoggle:'',
        domainId:null,
        fieldsForChange:{category_id:{address:'#inputcategory',required:true},
                        name:{address:'#inputname'},
                        age:{address:'#inputbirth', required:true},
                        sex:{address:'#inputsex', required:true},
                        color:{address:'#inputcolor', required:true},
                        breeding_area:{address:'#inputbreedingarea'},
                        height:{address:'#inputheight', required:true},
                        level:{address:'#inputlevel', required:true},
                        successful_to:{address:'#inputsuccessfulto', required:true},
                        successful_to:{address:'#inputsuccessfulto', required:true},
                        price_id:{address:'#inputprice', required:true},
                        add_to_top_bar:{address:'#inputaddtobar', required:true},
                        father:{address:'#inputfather'},
                        mothers_father:{address:'#inputmother'},
                        description :{address:'#inputdescriptionde'},
                        description_en :{address:'#inputdescriptionen'},
                        successes :{address:'#inputsuccessesde'},
                        successes_en :{address:'#inputsuccessesen'},
                        pedigree:{address:'#pedigreestr'}
                    },
        uploadImgDirObj : {
            'large':{'address':'uploads/photos/large/', 'width':'1200'},
            'medium':{'address':'uploads/photos/medium/', 'width':'600'},
            // 'original':{'address':'/uploads/photos/original/', 'width':'900'},
            'thumbs':{'address':'uploads/photos/thumbs/', 'width':'480'}
        },
        refreshTableHandler:'basic.gethorses',
        // view:'table',
        // horsescategory:['Jumpers','Dressage Horses','Jumpers + Dressage Horses','Foals','Breeding Mares','Stallions','Successful Horses','Hunters'],
        horsesCategory:['jumpers','dressageHorses','jumpersDressageHorses','foals','breedingMares','stallions','successfulHorses','hunters'],
        
        sexesen: ['Mare','Gelding','Stallion'],
        sexesde: ['Stute','Wallach','Hengst'],
        horsesColor:['grey','black','chestnut','bay','lightbay','brown','darkbrown','dun','withsomewhitehairs','roan','darkchestnut','dappledgrey','palomino'],
        horsesLevel:['A*','A**','L','M*','M**','S*','S**','S***','S****'],
        horsesSuccessful:['A*','A**','L','M*','M**','S*','S**','S***','S****'],
        editHorsesData:null,
        currentEditHorse:null,
        tableNamePhoto:'horse_photos',
        mainImgDir:'photos',
        fbsettings:null,
        postPhotoToFacebook:[],
        fbAttachedMedia:[],
        countPostToFacebook:0,
        countCheckExistPost:0,
        sendtoFbFlag:false,
        galleryTitleObg:{},
        postToFacebookData:{},
        postFbBlock:null,
        horseFormData: null,
        fbPostId:null,
        idPostedFb:null

    },
    

    _create: function () {
        var widget = this;
        
        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });

        this.element.on('mouseover','#horses th', function(){
            $(this).find('span.fooicon').css('opacity','1');
        });

        this.element.on('mouseout','#horses th', function(){
            $(this).find('span.fooicon').css('opacity','0');
        });

        this.element.on('click','#horses th.sortable', function(){
            widget.toggleSortIcon($(this));
        });

        $(window).bind('resize', function(){
            widget.resizeView();
        });
        
        this.element.on('click','tbody>tr.expanded', function(e){
            widget.toggleExpandIcon($(this), e.target);
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

        this.element.on('click', '.additems', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // setTimeout(function() { $('div.addnewsform #inputsubjde').focus()}, 500);
            $('div.card-heading').hide();
            widget.addItemsForm();
            widget.toggleTabContent('#horses-main-form');
            $('#horsesform .switch-edit-content').find('button:not(:first)').hide();
        });
        
        this.element.on('click','div#horsesform button.cancel-add', function(){
            $('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            widget._clearPedigree();
            widget.toggleTabContent('#horses-main-form');
        });

        this.element.on('click','div#horsesform .senddataonserver', function(e) {
            $('#horsesform').find('.has-error').removeClass('has-error');
            widget._collectPedigree();
            widget.options.postFbBlock = 'main';
            widget.options.horseFormData = widget.createItem(widget.options.fieldsForChange, 'basic.createhorses');
            widget.setActiveTabAfterUpdate();
            // widget.initimagesManager();
            widget.changeModalFooter(false);
        });

        this.element.on('click', '.edit-item, div.thumbs>a', function(e) {
            e.preventDefault();
            // setTimeout(function() { $('.editnewsform #inputsubjde').focus()}, 500);
            widget.getHorsesItem($(this).closest('tr').data('id'));
            widget.toggleTabContent('#horses-main-form');
        });
        
        this.element.on('click','div#horsesform .save-item', function(e) {
            var checkedFb = widget.checkFbChecked();
            widget._changeImageOnTable();
            $('#horsesform').find('.has-error').removeClass('has-error');
            widget._collectPedigree();
            widget.options.horseFormData = widget.updateItem();
            // if (checkedFb) widget.selectTabPostFb();
            // widget.setActiveTabAfterUpdate();
        });

        this.element.on('click','#login_fb', function(e) {
            e.preventDefault();
            // widget.myFacebookLogin(widget.options.postToFacebookData);
            widget.myFacebookLogin(function(){widget.selectTabPostFb()}, function(){widget.notLoginFb()});
        });

        this.element.on('click','div#horsesform button.cancel-edit', function(){
            widget._changeImageOnTable();
            $('div.edititemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            widget.clearForm();
            widget._clearPedigree();
        });

        this.element.on('click', 'table#horses td.act button.delete-item', function(e) {
            if(confirm(widget.options.dict.remove+' '+widget.options.dict[widget.options.tableName]+'?')){
                widget.deleteHorse($(this).closest('tr').data('id'));
            }
            else{
                e.preventDefault();
            }
        });
        
        this.element.on('click', '.page-nav', function (e) {
            e.preventDefault();
            widget.drawRowsInTable($(this).data('page'));
        });
        
        this.element.on('click', '.deactive-item', function (e) {
            e.preventDefault();
            widget.activeItem($(this));
        });

        this.element.on('focus', 'div#horsesform .modal-body input[type=text], .modal-body textarea', function() {
            $(this).next().hide();
        });

        this.element.on('blur', 'div#horsesform .modal-body input[type=text], .modal-body textarea', function() {
            if ($(this).val()=='') $(this).next().show();
        });
        
        this.element.on('click', '.switch-edit-content button', function() {
            widget.toggleTabContent($(this).data('href'));
        });

        this.element.on('click', '#pedigree label.toggle-button', function() {
            $(this).toggleClass('expand-button')
            $('#pedigree-container').slideToggle('fast');
        });
        
        this.element.on('click', '#horses-gallery button.make-main', function() {
            widget._setMainImage($(this).closest('li.gallery-list'));
        });
        
        this._drawTable();
        this.initFB();
    },
	
	_drawTable: function () {
        
        var widget = this;
        var dict = widget.options.dict;
        widget.options.tableSettings = {id: 'horses', class:'table table-condensed',
                            attr:{'data-paging-size':'5','data-paging-limit':'2'},
                            };
        widget.options.thobject = {'id':{id:'id', class:'sortable th-filter sortable',attr:null, text:'ID'},
                        'photo':{id:'photo', class:'photo',attr:{'data-priority':'6'},text:dict.photo},
                        'name':{id:'name', class:'name sortable th-filter',attr:{'data-priority':'1'}, text:dict.name},
                        'sex':{id:'sex', class:'sex sortable switchlang th-filter',attr:{'data-priority':'4','data-lang':'de'}, text:dict.sex},
                        'sex_en':{id:'sex_en', class:'sex sortable switchlang th-filter',attr:{'data-priority':'4','data-lang':'en'}, text:dict.sex},
                        'age':{id:'age', class:'age sortable th-filter', attr:{'data-priority':'5'},text:dict.age},
                        'father':{id:'father', class:'father sortable th-filter', attr:{'data-priority':'6'},text:dict.father},
                        'price':{id:'price', class:'price sortable th-filter', attr:{'data-priority':'2'},text:dict.prices},
                        'updated':{id:'updated', class:'updated sortable th-filter', attr:{'data-priority':'5', 'data-id':'date'},text:dict.updated},
                        'action':{id:'action', class:null, attr:null,text:dict.act}
                        };
        
        widget.getFBSettings(function(){widget.refresh()});
        // widget.refresh();
        
                    
    },

    displayTableData:function(_startrow, _finishrow){
        var widget = this;
        var acttd = "<div class='btn-group btn-group-xs act'>\
                        <button type='button' class='btn btn-default deactive-item' title='Invisible' alt='Invisible'>\
                            <span class='glyphicon glyphicon-off'>\
                        </button>\
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
        widget.options.domainId = items[0].domain_id;
        for (var i = _startrow; i < _finishrow; i++) {
            var item = items[i];
            var sexesen = widget.options.sexesen;
            var sexesde = widget.options.sexesde;
            var sexde = sexesde[item.sex];
            var sexen = sexesen[item.sex];
            var userName = item.name;  
            var age = new Date().getFullYear() - item.age;
            var father = item.father;
            var price = item.price;
            var updated = item.updated;
            var updatedAgo = widget.calculateUpdated(updated);
            var active = item.status;
            var userImage = item.image;
            var noPhotoClass = '';
            // var userimagethumb = user.image_thumb;
            var userImageThumb = item.filename;
            
            if ((!userImage)||userImage == 'NULL') 
                 userImage = userImageThumb;
            
            if ((!userImageThumb)||userImageThumb == null) {
                userImageThumb = '/uploads/photos/thumbs/thumb_no-user-image.jpg';
                noPhotoClass = 'no-photo';
                userImage = '/uploads/photos/thumbs/no-user-image.jpg';
            }
            else{
                userImageThumb = '/uploads/photos/thumbs/'+userImageThumb;
            }
            
            $('<tr/>', {'data-id': item.id, class:'expanded'}).append(
                $('<td/>').text(item.id),
                $('<td/>').css('text-align','center').append(
                    $('<div/>',{class:'thumbs '+ noPhotoClass}).append(
                        $('<a/>',{href:userImageThumb}).attr({'data-lightbox':'usermanager-gallery','data-title':'Фото '+userName, 'data-title2':'Изменить фото'}).append(
                            $('<img/>',{src: userImageThumb})
                            // $('<div/>',{class:'caption'}).append(
                            //     $('<span/>',{class:'title'}).append(
                            //         $('<a/>',{href:'#'}).text('Изменить')
                            //     )
                            // )
                        )
                    )
                ),
                $('<td/>', {class: 'name'}).text(userName),
                $('<td/>', {class: 'switchlang'}).attr({'data-name':'sex_de','data-lang':'de'}).text(sexde),
                $('<td/>', {class: 'switchlang'}).attr({'data-name':'sex_en','data-lang':'en'}).text(sexen),
                $('<td/>').text(age),
                $('<td/>').text(father),
                $('<td/>').text(price),
                $('<td/>').text(updatedAgo).val(updated),
                $('<td/>', {class: 'act'}).append(acttd)
                
            ).appendTo(widget.options.tbody);
            if (item.status == 'deleted') $('tr[data-id='+item.id+'] div.act button.deactive-item').addClass('deleted').attr({'title':'Visible','alt':'Visible'});
        }
    },
    
    createItemsForm:function(){
        var widget = this;
        
        var descriptionde = document.createElement('textarea');
        var descriptionen = document.createElement('textarea');
        var successesde = document.createElement('textarea');
        var successesen = document.createElement('textarea');

        descriptionde.setAttribute('id','inputdescriptionde');
        descriptionde.setAttribute('rows','4');
        descriptionen.setAttribute('id','inputdescriptionen');
        descriptionen.setAttribute('rows','4');
        successesde.setAttribute('id','inputsuccessesde');
        successesde.setAttribute('rows','4');
        successesen.setAttribute('id','inputsuccessesen');
        successesen.setAttribute('rows','4');
        sendRequest({
            action: 'basic.gethorsesprices',
            data: {},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.options.horsesPrices = response.data.horsesprices;
                    if ($('#'+widget.options.tableid+'form').length == 0) {
                        $('div.card').append(
                            $('<div/>', {class:'additemsform itemsform-hidden', id:widget.options.tableid+'form'}).append(
                              
                                $('<div/>',{class:'btn-group switch-edit-content'}).append(
                                    $('<button/>',{class:'btn btn-default active'}).attr('data-href','#horses-main-form').text('Main information'),
                                    $('<button/>',{class:'btn btn-default'}).attr('data-href','#horses-videos').css('display','none').text('Videos'),
                                    $('<button/>',{class:'btn btn-default'}).attr('data-href','#horses-photos').css('display','none').text('Photos')
                                ),
                                $('<div/>',{class:'tab-content'}).append(
                                    $('<div/>',{class:'tab-pane active', id:'horses-main-form'}).append(   
                                        $('<div/>',{class:'itemsform-dialog'}).append(
                                            $('<div/>',{class:'itemsform-content'}).append(
                                                $('<div/>',{class:'modal-header'}).append(
                                                    $('<h4/>', {class:'modal-title'}).text(widget.options.dict.create+' '+widget.options.dict[widget.options.tableid])
                                                ),
                                                $('<div/>',{class:'modal-body'}).append(
                                                    $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                                        $('<div/>',{class:'row'}).append(
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputcategory').text(widget.options.dict.category),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputcategory'}),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputname').text(widget.options.dict.name),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        $('<input/>',{class:'form-control', type:'text', id:'inputname'}).attr('placeholder', widget.options.dict.input_name_plholder),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-3'}).attr('for','inputbirth').text(widget.options.dict.year_of_birth+' (yyyy)'),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        $('<input/>',{class:'form-control', type:'text', id:'inputbirth'}).attr('placeholder', widget.options.dict.input_birth_plholder),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            
                                                            $('<div/>',{class:'form-box col-sm-offset-3 col-sm-4'}).append(    
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputsex').text(widget.options.dict.sex),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputsex'}),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-sm-4'}).append( 
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputcolor').text(widget.options.dict.color),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputcolor'}),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputbreedingarea').text(widget.options.dict.breedingarea),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        $('<input/>',{class:'form-control', type:'text', id:'inputbreedingarea'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.breedingarea),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),

                                                            $('<div/>',{class:'form-box col-sm-offset-3 col-sm-4'}).append(    
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputheight').text(widget.options.dict.height),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<input/>',{class:'form-control', type:'text', id:'inputheight'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.height),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-sm-4'}).append( 
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputlevel').text(widget.options.dict.level),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputlevel'}).append(
                                                                            $('<option/>').text('none').val('55')
                                                                        ),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-3'}).attr('for','inputsuccessfulto').text(widget.options.dict.successfulto),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputsuccessfulto'}).append(
                                                                            $('<option/>').text('none').val('0')
                                                                        ),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-sm-offset-3 col-sm-4'}).append(
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputprice').text(widget.options.dict.pricerange),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputprice'}).append(
                                                                            $('<option/>').text('0 (on request)').val('0')
                                                                        ),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-sm-4'}).append(
                                                                $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputaddtobar').text(widget.options.dict.addtotopbar),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<select/>',{class:'form-control', id:'inputaddtobar'}).append(
                                                                            $('<option/>').text(widget.options.dict.yes).val('1'),
                                                                            $('<option/>').text(widget.options.dict.no).val('0')
                                                                        ),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-sm-offset-3 col-sm-4'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputfather').text(widget.options.dict.father),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<input/>',{class:'form-control', type:'text', id:'inputfather'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.father),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-sm-4'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputmother').text(widget.options.dict.mothersfather),
                                                                    $('<div/>',{class:'col-sm-12'}).append(
                                                                        $('<input/>',{class:'form-control', type:'text', id:'inputmother'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.mothersfather),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputdescriptionde').text(widget.options.dict.description+' (de)'),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        descriptionde,
                                                                        // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtexten'}).attr('placeholder',widget.options.dict.input_texten_pl_holder),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputdescriptionen').text(widget.options.dict.description+' (en)'),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        descriptionen,
                                                                        // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtexten'}).attr('placeholder',widget.options.dict.input_texten_pl_holder),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputsuccessesde').text(widget.options.dict.successes+' (de)'),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        successesde,
                                                                        // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtexten'}).attr('placeholder',widget.options.dict.input_texten_pl_holder),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'form-box col-xs-12'}).append(
                                                                $('<div/>',{class:'form-group responsive-label'}).append(
                                                                    $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputsuccessesen').text(widget.options.dict.successes+' (en)'),
                                                                    $('<div/>',{class:'col-sm-8'}).append(
                                                                        successesen,
                                                                        // $('<textarea/>',{class:'form-control',rows:'6',cols:'80', id:'inputtexten'}).attr('placeholder',widget.options.dict.input_texten_pl_holder),
                                                                        $('<span/>',{class:'error-form'})
                                                                    )
                                                                )
                                                            ),
                                                            $('<div/>',{class:'col-xs-12', id:'pedigree'}),
                                                            $('<div/>',{class:'form-box col-xs-12'}).css('display','none').append(
                                                               // $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<input/>',{class:'form-control', type:'text', id:'pedigreestr'})
                                                                // )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    ),

                                    $('<div/>',{class:'tab-pane', id:'horses-videos'}),
                                    $('<div/>',{class:'tab-pane', id:'horses-photos'})
                        
                                ),
                                $('<div/>', {class:'modal-footer col-sm-11 col-lg-10', id:'footer'}).append(
                                    $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.create),
                                    $('<button/>', {class: 'btn btn-default cancel-add', type:'button'}).text(widget.options.dict.cancel)
                                )
                            )
                            
                        )
                        for (var i = 0; i < widget.options.horsesCategory.length; i++) {
                            var horseCategory = widget.options.horsesCategory[i];
                            $('select#inputcategory').append(

                                $('<option/>').text(widget.options.dict[horseCategory]).val(i)
                            )

                        };
                        var inputsex = widget.options.sexesen;
                        
                        if (widget.options.lang == 'de') inputsex = widget.options.sexesde;
                        
                        for (var j = 0; j < inputsex.length; j++) {
                            $('select#inputsex').append(
                                $('<option/>').text(inputsex[j]).val(j)
                            )
                            
                        };
                        for (var k = 0; k < widget.options.horsesColor.length; k++) {
                            $('select#inputcolor').append(
                                $('<option/>').text(widget.options.dict[widget.options.horsesColor[k]]).val(k)
                            )
                            
                        };
                        for (var q = 0; q < widget.options.horsesLevel.length; q++) {
                            $('select#inputlevel').append(
                                $('<option/>').text(widget.options.horsesLevel[q]).val(q)
                            )
                            
                        };
                        for (var w = 0; w < widget.options.horsesSuccessful.length; w++) {
                            $('select#inputsuccessfulto').append(
                                $('<option/>').text(widget.options.horsesSuccessful[w]).val(w)
                            )
                            
                        };
                        
                        for(var key in widget.options.horsesPrices){
                            var priceobj = widget.options.horsesPrices[key];
                            if (priceobj['less_more'] == '0') {
                                $('select#inputprice').append(
                                    $('<option/>').text('less_than '+priceobj['price']).val(priceobj['id'])
                                )
                            }else{
                                $('select#inputprice').append(
                                    $('<option/>').text('more_than '+priceobj['price']).val(priceobj['id'])
                                )
                            }
   
                        }
                        widget._appedPedigreeForm('#pedigree');
                    
                    }
                    
                    
                }
            }
        });
    },
    
    getHorsesItem: function(_itemid){
        var widget = this;
        $('#horses-photo-block').remove();
        $('#horses-video-block').remove();
        $('#'+widget.options.tableName+'form').find('.has-error').removeClass('has-error');
        $('div.card-heading').hide(); 
        $('#horsesform .switch-edit-content').find('button').show();
        widget.options.currentEditHorse = _itemid;
        sendRequest({
            action: 'basic.gethorsesitem',
            data: {itemid: _itemid,tablename:widget.options.tableName},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var item = widget.options.editHorsesData = response.data.item;
                    var form = $('div#'+widget.options.tableid+'form').attr('data-id', _itemid);
                    form.find('.modal-title').text(widget.options.dict.edit+' '+widget.options.dict.horses+' #'+_itemid);
                    form.find('span.error-form').text('');
                    form.removeClass('additemsform itemsform-hidden').addClass('edititemsform itemsform-visible');

                    var itemobj = widget.options.fieldsForChange;
                    for(var key in itemobj){
                        var address = itemobj[key].address;
                        form.find(address).val(item[key]);
                    };
                    // widget.drawhorsesphoto();
                    widget.element.find('#horses-photos').append(
                    	$galleryContent = $('<div/>',{id:'horses-photo-block'})
	                );
                    widget.element.find('#horses-videos').append(
                        $videoContent = $('<div/>',{id:'horses-video-block'})
                    );
                    widget._decomposePedigree(item.pedigree);
                    widget.initImagesManager($galleryContent);
                    widget.initVideosManager($videoContent);
                    // widget._changeimageontable();
                    widget.changeModalFooter(false);
                    widget.addOptionSendToFacebook(widget.element.find('#footer'));

                    // widget.element.find('#send_to_fb').remove();
                    // if (item.facebook == 'yes'){
                    //     widget.element.find('#horsesform .modal-footer').prepend(
                    //         $('<label/>',{class:'control-label', id:'send_to_fb'}).text(widget.options.dict.sendtofb+':').append(
                    //             $inp = $('<input/>',{type:'checkbox', id:'inputsendtofb'}),
                    //             $('<span/>',{class:'error-form'})
                    //         )
                    //     );
                    //     if (item.sendToFbDefault == 'yes'){
                    //         $inp.attr('checked','checked');  
                    //     }else{
                    //         $inp.removeAttr('checked');
                    //     }
                        
                    // }                   
                }
            }
            
        });
        // setTimeout(function() {widget._tinymceinit()});
    },

    activeItem:function(_el){
        var widget = this;
        var data = '';
        var itemid = _el.closest('tr').data('id');
        
        (_el.hasClass('deleted'))? data = 'active': data = 'deleted';
        sendRequest({
            action: 'basic.activeitem',
            data: {itemid: itemid, data: data, tablename:widget.options.tableName},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    _el.attr('title','')
                    widget.refresh();
                }
            }
        });
    },

    deleteHorse: function (_id) {
        var widget = this;
        var tableName = widget.options.tableName;
        var uploadImgDirObj = widget.options.uploadImgDirObj;
        var uploadImgDirArr = [];
        for (var key in uploadImgDirObj) {
            var address = uploadImgDirObj[key].address;
            address = address.substr(1);
            uploadImgDirArr.push(address); 
        };
        sendRequest({
            action: 'basic.deletehorses',
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

    setActiveTabAfterUpdate:function(){
        var widget = this;
        var activeTabId = $('.tab-content').children('div.active').attr('id');
        if (activeTabId == 'horses-main-form') {
            var nextTab = $('div.switch-edit-content button[data-href=#horses-videos]').attr('data-href');
            widget.toggleTabContent(nextTab);
        }else{
            widget.toggleTabContent('#'+activeTabId);
        }
    },

    actionAfterUpdateItem:function(){
        var widget = this;
        var checkedFb = widget.checkFbChecked();
        if (checkedFb) {
            widget.selectTabPostFb();
        }else{
            widget.refreshTable($(this).serializeObject(), widget.options.refreshTableHandler);
            widget.setCheckSendToFb();
            widget.setActiveTabAfterUpdate();
        }
        return;
    },

    initImagesManager:function(_galleryContent){
        var widget = this;
       
        widget.options.ImgThumbEditContainer = "<div class='thumb-box'>\
                            <div class='btn-group btn-group-xs action-bar-image'>\
                                <button type='button' class='btn btn-default make-main' title='make main' alt='make main'>\
                                    <span class='glyphicon glyphicon-star-empty'>\
                                </button>\
                                <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                                    <span class='glyphicon glyphicon-trash'>\
                                </button>\
                            </div>\
                            <div class='gallery-thumbnail-contailer'></div>\
                            <form class='form-horizontal' role='form'>\
                                <div class='form-group responsive-label'>\
                                    <label class='col-xs-12 control-label' for='name-'>Name</label>\
                                    <div class='col-xs-12'>\
                                        <input class='form-control' id='name-' type='text' data-table-field='name' placeholder='"+widget.options.dict.input+' '+widget.options.dict.name+"'>\
                                    </div>\
                                </div>\
                            </form>\
                        </div>";

        widget.element.find('#horses-photo-block')
            .imagesmanager({
                dict: widget.options.dict,
                imgNameField: 'filename', 
                imgIdField: 'id',
                uploadimgdirobj:widget.options.uploadImgDirObj,
                galleryid:'horses',
                mainImgDir:'photos',
                thumbContainer:widget.options.ImgThumbEditContainer,
                refreshContentAction:'basic.gethorsesimages',
                refreshContentData:{horseid: widget.options.currentEditHorse, tablename:widget.options.tableNamePhoto},
                addimgtobdAction:'basic.addhorsesimgtobd',
                addimgtobdData:{file: '', horseid:widget.options.currentEditHorse},
                deleteImgAction:'basic.deletehorsesimgfrombd',
                deleteImgData: {itemid: '', tablename: widget.options.tableNamePhoto, horsesid:widget.options.currentEditHorse},
                saveGalleryItemsAction:'basic.updateimggallery',
                saveGalleryItemsData:{tablename: widget.options.tableNamePhoto},
                sortable:true
            });
        
    },

    initVideosManager:function(_vContent){
        var widget = this;
        var saveBtn = this.element.find('.save-item');
        widget.options.VideoThumbEditContainer = "<div class='thumb-box'>\
                            <div class='btn-group btn-group-xs action-bar-image'>\
                                <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                                    <span class='glyphicon glyphicon-trash'>\
                                </button>\
                            </div>\
                            <a class='play-video-modal'>\
                                <div class='gallery-thumbnail-contailer'>\
                                    <div class='icon-play'></div>\
                                </div>\
                            </a>\
                            <form class='form-horizontal' role='form'>\
                                <div class='form-group responsive-label'>\
                                    <label class='col-xs-12 control-label' for='name-'>Name</label>\
                                    <div class='col-xs-12'>\
                                        <input class='form-control' id='name-' type='text' data-table-field='title' placeholder='"+widget.options.dict.input+' '+widget.options.dict.name+"'>\
                                    </div>\
                                </div>\
                            </form>\
                        </div>";

        widget.element.find('#horses-video-block')
            .videosmanager({
                dict: widget.options.dict, 
                galleryid:'horses-v',
                domainId:widget.options.domainId,
                horseId:widget.options.currentEditHorse,
                refreshContentAction:'basic.gethorsesvideos',
                refreshContentData:{horseid: widget.options.currentEditHorse, tablename:'horse_videos_v2'},
                deleteVideoAction:'basic.deletehorsesvideobd',
                deleteVideoData: {itemid: '', tablename: 'horse_videos_v2'},
                thumbContainer:widget.options.VideoThumbEditContainer,
                saveGalleryItemsAction:'basic.updatevideogallery',
                saveGalleryItemsData:{tablename: 'horse_videos_v2'},
                sortable:true,
                thumbContainerUpdateImg:widget.options.ImgThumbEditContainer,
                saveBtn:saveBtn
            });
    },

    _appedPedigreeForm:function(_appenTo){
        var widget = this;
        widget.element.find(_appenTo).append(
            $('<div/>',{class:'form-group responsive-label form-pedigree'}).append(
                $('<div/>',{class:'col-sm-3 col-xs-12'}).append(
                    $('<label/>',{class:'control-label default-label toggle-button expand-button'}).text('Pedigree ').attr('for','pedigree[f][name]')
                ),
                $('<div/>',{id:'pedigree-container', class:'col-sm-8 col-xs-12'}).append(
                    $('<div/>',{class:'col-xs-12 pedigree-row'}).append(
                        $('<div/>',{class:'row'}).append(
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[f][h]',value:'1'}).attr('data-pedigree','')
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('f'),
                                            
                                        $('<input/>',{class:'form-control', type:'text', name:'pedigree[f][name]'})
                                    )
                                )
                            ),
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[ff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('ff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[ff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[fm][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('fm'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[fm][name]'})
                                    )
                                )
                            )
                        ),
                    
                        $('<div/>',{class:'row'}).append(
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[fff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('fff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[fff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[ffm][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('ffm'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[ffm][name]'})
                                    ),$('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[fmf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('fmf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[fmf][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[fmm][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('fmm'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[fmm][name]'})
                                    )
                                )
                                
                            ),
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[ffff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('ffff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[ffff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[ffmf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('ffmf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[ffmf][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[fmff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('fmff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[fmff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[fmmf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('fmmf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[fmmf][name]'})
                                    )  
                                )
                                
                            )
                        )
                    ),
                    $('<div/>',{class:'col-xs-12 pedigree-row'}).append(
                        $('<div/>',{class:'row'}).append(
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[m][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('m'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[m][name]'})
                                    )
                                )
                            ),
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mf][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mm][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mm'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mm][name]'})
                                    )
                                )
                            )
                        ),
                        $('<div/>',{class:'row'}).append(
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mfm][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mfm'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mfm][name]'})
                                    ),$('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mmf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mmf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mmf][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mmm][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mmm'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mmm][name]'})
                                    )
                                )
                                
                            ),
                            $('<div/>',{class:'col-md-6 col-xs-12 pedigree-section'}).append(
                                $('<div/>',{class:'col-xs-12 pedigree-block'}).append(
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mfff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mfff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mfff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mfmf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mfmf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mfmf][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mmff][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mmff'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mmff][name]'})
                                    ),
                                    $('<div/>',{class:'input-group pedigree-group'}).append(
                                        $('<span/>',{class:'input-group-addon'}).append(
                                            $('<input/>',{type:'checkbox', name:'pedigree[mmmf][h]', value:'1'})
                                        ),
                                        $('<span/>',{class:'input-group-addon parents'}).text('mmmf'),
                                        $('<input/>',{class:'form-control', type:'text',  name:'pedigree[mmmf][name]'})
                                    )  
                                )
                            )
                        )
                    )
                )
                
            )
        );
    },

    _collectPedigree:function(){
        var widget = this;
         
        var pedigreeStr = '';
        var form = $('#horses-main-form .form-pedigree');
        var allInputs = form.find('input[name]');
        var textInputs = form.find('input[type=text]');
        var pedigreeGroup = form.find('.pedigree-group');
        var valObj = allInputs.serializeObject();
        pedigreeStr = 'a:'+textInputs.length+':{';

        for (var i = 0; i < pedigreeGroup.length; i++) {
            var input = pedigreeGroup[i].querySelectorAll('input[type=text]')[0];
            var inputVal = input.value;
            var inputName = input.name;
            var parentStr = inputName.substring(inputName.indexOf('[')+1);
            parentStr = parentStr.substring(0,parentStr.indexOf(']'));
            pedigreeStr += 's:'+parentStr.length+':"'+parentStr+'";';
            var checked = pedigreeGroup[i].querySelectorAll('input[type=checkbox]')[0].checked;
            if (checked) {
                pedigreeStr += 'a:2:{s:1:"h";s:1:"1";s:4:"name";s:'+inputVal.length+':"'+inputVal+'";}';
            }else{
                pedigreeStr += 'a:1:{s:4:"name";s:'+inputVal.length+':"'+inputVal+'";}';
            }
        }
        
        pedigreeStr += '}';
        
        form.find('#pedigreestr').val(pedigreeStr);
        return pedigreeStr;

    },

    _decomposePedigree:function(_pedigree){
        var widget = this;
        var pedigreeObj = _pedigree;
        var form = $('#horses-main-form .form-pedigree');
        for (var field in pedigreeObj) {
            var fieldObj = pedigreeObj[field];
            if (fieldObj.h) {
                form.find('input[name="pedigree['+field+'][h]"]').attr('checked', 'checked');
            }else{
                form.find('input[name="pedigree['+field+'][h]"]').removeAttr('checked');
            }
            form.find('input[name="pedigree['+field+'][name]"]').val(fieldObj.name);
        }
        
    },

    _clearPedigree:function(){
        var widget = this;
        var form = $('#pedigree-container');
        form.find('input[type=text]').val('');
        form.find('input[type=checkbox]').removeAttr('checked');
        form.hide();
        $('#pedigree label.toggle-button').addClass('expand-button');
    },

    _setMainImage:function(el){
        var widget = this;
        var itemid = widget.options.currentEditHorse;
        var li = el;
        var imgid = null;
        if (li) imgid = li.attr('data-id');
        
        sendRequest({
            action: 'basic.setmainimage',
            data: {itemid:itemid, imgid: imgid, tablename:'horses'},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    if (li) {
                        li.closest('ul').find('li.main-image').removeClass('main-image');
                        li.addClass('main-image');
                        widget.element.find('ul.gallery-data span.glyphicon-star').removeClass('glyphicon-star').addClass('glyphicon-star-empty'); 
                        li.find('span.glyphicon-star-empty').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
                    };
                    widget._changeImageOnTable();
                    
                }
            }
            
        });
    },
    
    _changeImageOnTable:function(){
        var widget = this;
        var itemid = widget.options.currentedithorse;
        var imgsrc = widget.element.find('div.gallery-block li.main-image').find('div.gallery-thumbnail-contailer').attr('data-imgsrc');
        if (!imgsrc) imgsrc = '/uploads/photos/thumbs/thumb_no-user-image.jpg';
        var thumbsOnTable = $('table#horses tr[data-id='+itemid+']').find('div.thumbs');
        thumbsOnTable.find('a').attr('href',imgsrc);
        thumbsOnTable.find('img').attr('src',imgsrc);
    },

    selectTabPostFb:function(){
        var widget = this;
        var activeTab = widget.element.find('.tab-content>div.active');
            if(activeTab.attr('id') == 'horses-photos'){
                widget.collcetImageTitleBeforeSave();
                widget.options.postFbBlock = 'photos';
                
            }else if(activeTab.attr('id') == 'horses-main-form'){
                widget.options.postFbBlock = 'main';
                widget.options.idPostedFb = widget.options.currentEditHorse;
                widget.getFbPostId('horses', widget.options.idPostedFb, 'fb_post_id', function(){widget.beforePostToFb()});
            }else if(activeTab.attr('id') == 'horses-videos'){
                widget.options.postFbBlock = 'videos';
                if (widget.options.sendtoFbFlag) widget.fbGetLoginStatus(function(){widget.getHorsesVideos()}, function(){widget.notLoginFb()});
                
            };
    },

    collcetImageTitleBeforeSave:function(){
        var widget = this;
        var galleryTitleObg = widget.options.postToFacebookData;
        var liGallery = $('#horses-photo-block').find('li.gallery-list');
        liGallery.each( function(){
            var liGalleryId = $(this).data('id');
            var name = $(this).find('input[data-table-field=name]').val();
            galleryTitleObg[liGalleryId] = {'name':name};
        });
        widget.options.postToFacebookData = galleryTitleObg;
        if (widget.options.sendtoFbFlag) widget.fbGetLoginStatus(function(){widget.dataPostToFacebook(galleryTitleObg)}, function(){widget.notLoginFb()});
    },
    
    getHorsesVideos:function(){
        var widget = this;
        sendRequest({
            action: 'basic.gethorsesvideos',
            data: {tablename:'horse_videos_v2', horseid:widget.options.currentEditHorse},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var videos = response.data.videos;
                    // widget.options.countCheckExistPost = 0;
                    
                    for (var i = 0; i < videos.length; i++) {
                        var video = videos[i];
                        widget.options.idPostedFb = video.id;
                        widget.prepareVideosFbData(video);
                    };
                }
            }
            
        });
    },

    prepareVideosFbData:function(_video){
        var widget = this;
        var lang = widget.options.lang;
        
        var horseId = widget.options.currentEditHorse;
        var horseFormData = widget.options.horseFormData.data[widget.options.currentEditHorse]    
        
        var message = widget.options.dict.newHorseVideo + ' by ' + new Date();
        var category = horseFormData.category_id;
        category = widget.options.horsesCategory[category];
        category = widget.options.dict[category];
        
        var categoryBeforeId = category.replace(/ /ig, '+');//замена всех пробелов на '+'
        var categoryAfterId = category.replace(/ /ig, '-');
        
        var father = horseFormData.father;
        var fatherReplace = father.replace(/ /ig, '-');
        var mothersfather = horseFormData.mothers_father;
        mothersfather = mothersfather.replace(/ /ig, '-'); 
        var year = new Date();
        var old = year.getFullYear() - (+horseFormData.age);
        var sexOpt = widget.options.sexesen;
        if (lang == 'de')  sexOpt = widget.options.sexesde;
        var videName = $('#horses-video-block li.gallery-list input#name-'+_video.id).val();
        var data = {
            'message': message,
            'link': String(document.location.origin)+'/'+lang+'/horses/'+categoryBeforeId+'/'+horseId+'-'+categoryAfterId+'-'+widget.options.dict['htFrom']+'-'+fatherReplace+'-x-'+mothersfather+'.html?vid='+_video.id+'#videos',
            'name': horseFormData.name + ', ' + category + ' - ' + old + '-' + ((horseFormData.sex == '1')? widget.options.dict['yearsOld'] : widget.options.dict['yearsOldMare']) + ' ' + sexOpt[horseFormData.sex],
            'description': (videName)? videName : widget.options.dict.defaultHorseVideoDescription,
            'picture' : String(document.location.origin)+'/uploads/videos_v2/'+widget.options.domainId+'/'+horseId+'/'+_video.id+'/thumb.jpg',
        };
        
        widget.checkExistVideoOnFb(data, _video.fb_post_id, _video.id);
    },

    checkExistVideoOnFb:function(_data, _fbPostId, _videoid){
        var widget = this;
        if (_fbPostId) {
            FB.api('/'+_fbPostId, 'GET', 
                function (response) {
                    if (response && response.error) {
                        widget.postVideoToFb(_data, _videoid);
                    }
                }
            );
        }else{
            widget.postVideoToFb(_data, _videoid);
        }
    },
    
    postVideoToFb:function(_data, _videoid){
        var widget = this;
        if (widget.options.sendtoFbFlag) widget.publishToFacebook(_data, null, null, _videoid);
    },

    dataPostToFacebook:function(_data, _fbPostId){
        var widget = this;
        if (widget.options.postFbBlock == 'photos') {
            sendRequest({
                action: 'basic.gethorsesimages',
                data: {tablename:widget.options.tableNamePhoto, horseid:widget.options.currentEditHorse},
                
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    }
                    else{
                        var images = response.data.images;
                        widget.options.countCheckExistPost = 0;
                        widget.options.postPhotoToFacebook.length = 0;
                        widget.options.fbAttachedMedia.length = 0;
                        for (var i = 0; i < images.length; i++) {
                            var image = images[i];
                            var imageId = image['id'];
                            image['name'] = _data[imageId].name;
                            widget.checkExistPhotoPost(images[i], images.length, widget.options.postPhotoToFacebook);
                        };
                        widget.clearObj(widget.options.postToFacebookData);
                        widget.setCheckSendToFb();
                        widget.setActiveTabAfterUpdate();
                        // console.log(widget.options.galleryTitleObg);
                    }
                }
                
            });
        }else if (widget.options.postFbBlock == 'main') {
            widget.publishToFacebook(_data, null, _fbPostId);
            widget.clearObj(_data);
            widget.setCheckSendToFb();
            widget.setActiveTabAfterUpdate();
        };
        
    },

    beforePostToFacebook:function(_image, imagesNum){
        var widget = this;
        var domen = window.location.origin;
        var imgSrc = domen+'/uploads/'+widget.options.mainImgDir+'/large/'+_image.filename;
        imgSrc = imgSrc.toString();
        var title = _image['name'];
        var data = {};
        data.url = imgSrc;
        data.caption = title;
        data.published = false;
        data.access_token = widget.options.fbAccesToken;
        widget.postPhotoToFacebook(data, imagesNum);
        
    },

    setFbPostId:function(_id, _videoid){
        var widget = this;
        if (widget.options.postFbBlock == 'photos') {
            sendRequest({
                action: 'basic.sethorsephotosfbpostid',
                data: {fbPostId:_id, images:widget.options.postPhotoToFacebook},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    }else{
                        widget.options.postPhotoToFacebook.length = 0;
                    }
                }
                
            });
        }else if (widget.options.postFbBlock == 'main') {
            sendRequest({
                action: 'basic.sethorsemainfbpostid',
                data: {fbPostId:_id, horseid:widget.options.idPostedFb},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    }else{
                        widget.clearObj(widget.options.postToFacebookData);
                    }
                }
                
            });
        }else if (widget.options.postFbBlock == 'videos') {
            sendRequest({
                action: 'basic.sethorsevideofbpostid',
                data: {fbPostId:_id, videoid:_videoid},
                successHandler: function (_callbackParams) {
                    var response = _callbackParams.response;
                    if (!response.success) {
                        alert(response.message);
                    }
                }                
            });
        };
    },

    beforePostToFb:function(){
        var widget = this;
        widget.fbGetLoginStatus(function(){widget.checkExistPostFb(widget.options.fbPostId)}, function(){widget.notLoginFb()});
    },

    postToFb:function(_data){
        var widget = this;
        var postToFacebookData = widget.getHorseFbData('newHorse', _data);
        widget.options.postToFacebookData = postToFacebookData;
        if (widget.options.sendtoFbFlag) widget.dataPostToFacebook(postToFacebookData);
    },

    updateFbPost:function(_fbPostId){
        var widget = this;
        var fbPostId = _fbPostId;
        var postToFacebookData = widget.getHorseFbData('updateHorse');
        widget.options.postToFacebookData = postToFacebookData;
        if (widget.options.sendtoFbFlag) widget.dataPostToFacebook(postToFacebookData, _fbPostId);
    },

    getHorseFbData:function($message, _data){
        var widget = this;
        var lang = widget.options.lang;
        var horseFormData = {};
        var horseId = null;
        if (_data) {
            horseId = _data.id;
            horseFormData = _data[horseId];
        }else{
            horseId = widget.options.currentEditHorse;
            horseFormData = widget.options.horseFormData.data[widget.options.currentEditHorse]    
        };
        
        var message = widget.options.dict[$message] + ' by ' + new Date();
        var category = horseFormData.category_id;
        category = widget.options.horsesCategory[category];
        category = widget.options.dict[category];
        
        var categoryBeforeId = category.replace(/ /ig, '+');
        var categoryAfterId = category.replace(/ /ig, '-');
        
        var father = horseFormData.father;
        var fatherReplace = father.replace(/ /ig, '-');
        var mothersfather = horseFormData.mothers_father;
        mothersfather = mothersfather.replace(/ /ig, '-'); 
        var year = new Date();
        var old = year.getFullYear() - (+horseFormData.age);
        var sexOpt = widget.options.sexesen;
        if (lang == 'de')  sexOpt = widget.options.sexesde;
        
        var data = {
            'message': message,
            'link': String(document.location.origin)+'/'+lang+'/horses/'+categoryBeforeId+'/'+horseId+'-'+categoryAfterId+'-'+widget.options.dict['htFrom']+'-'+fatherReplace+'-x-'+mothersfather+'.html',
            'name': horseFormData.name + ', ' + category + ' - ' + old + '-' + ((horseFormData.sex == '1')? widget.options.dict['yearsOld'] : widget.options.dict['yearsOldMare']) + ' ' + sexOpt[horseFormData.sex],
            'description': (lang == 'de')?  horseFormData.description : horseFormData.description_en
        };
        if (data.description == '') data.description = widget.options.dict['defaultHorseDescription'];
        if (horseFormData.father != '') {
            data.name += ' ' + widget.options.dict['htFrom'] + ' ' + horseFormData.father;  
            if (horseFormData.mothers_father != '') data.name += ' x ' + horseFormData.mothers_father;
        }
        if (horseFormData.successful_to != '55') {
            data.caption = widget.options.dict['successfulto']+': ' + widget.options.horsesSuccessful[horseFormData.level];
        }; 
        var imgsrc = widget.element.find('div.gallery-block li.main-image').find('div.gallery-thumbnail-contailer').attr('data-imgsrc');
        if (imgsrc) {
            data.picture = window.location.origin + imgsrc.replace('thumbs', 'large');
        }else{
            data.picture = window.location.origin + '/img/fb-default.jpg';
        }
        return data;
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
