/**
* Tags Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.15
*/
$.widget('nm.tagsmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'tags',
        tableId:'tags',
        tableSettings:null,
        thobject:null,
        tdobject:null,
        thtoggle:'',
        toggleCount:null,
        fieldsForChange:{
            tag_de:{address:'#inputtagde',required:true},
            tag_en:{address:'#inputtagen',required:true},
            data:{address:'#datastr'}
        },
        refreshTableHandler:'basic.gettags',
        
        horsesCategoryKey:['jumpers','dressage_horses','jumpers_dressage_horses','foals','breeding_mares','stallions','successful_horses','hunters'],
        sexesen: ['Mare','Gelding','Stallion'],
        sexesde: ['Stute','Wallach','Hengst'],
        horsesColor:['grey','black','chestnut','bay','lightbay','brown','darkbrown','dun','withsomewhitehairs','roan','darkchestnut','dappledgrey','palomino'],
        horsesLevel:['A*','A**','L','M*','M**','S*','S**','S***','S****'],
        horsesSuccessful:['A*','A**','L','M*','M**','S*','S**','S***','S****']
         
    },
    

    _create: function () {
        var widget = this;
        
        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });

        this.element.on('mouseover','#tags th', function(){
            $(this).find('span.fooicon').css('opacity','1');
        });
        
        this.element.on('mouseout','#tags th', function(){
            $(this).find('span.fooicon').css('opacity','0');
        });

        this.element.on('click','#tags th.sortable', function(){
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
            $('div.card-heading').hide();
            widget.addItemsForm();
            $('div.additemsform').removeClass('itemsform-hidden').addClass('itemsform-visible');
        });
        
        this.element.on('click','div#tagsform button.cancel-add', function(){
            $('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
        });

        this.element.on('click','div#tagsform .senddataonserver', function(e) {
            widget._collectDataStr();
            $('#tagsform').find('.has-error').removeClass('has-error');
            widget.createItem(widget.options.fieldsForChange, 'basic.createitem');
            
        });

        this.element.on('click', '.edit-item', function(e) {
            e.preventDefault();
            $('#tagsform').find('.has-error').removeClass('has-error');
            widget._getTagsItem($(this).closest('tr').data('id'));
        });

        this.element.on('click','div#tagsform .save-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            widget._collectDataStr();
            widget.updateItem();
        });

        this.element.on('click','div#tagsform button.cancel-edit', function(){
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
        
        this.element.on('click', '.page-nav', function (e) {
            e.preventDefault();
            widget.drawRowsInTable($(this).data('page'));
        });
       
        $('body').on('focus', 'div#tagsform .modal-body input[type=text], .modal-body textarea', function() {
            $(this).next().hide();
        });
        
        $('body').on('blur', 'div#tagsform .modal-body input[type=text], .modal-body textarea', function() {
            if ($(this).val()=='') $(this).next().show();
        });
        
        this._drawTable();
    },
	
	_drawTable: function () {
        var widget = this;
        
        var dict = widget.options.dict;
        widget.options.tableSettings = {id: 'tags', class:'table table-condensed',
                            attr:{'data-paging-size':'5','data-paging-limit':'2'},
                            };
        widget.options.thobject = {'id':{id:'id', class:'sortable th-filter sortable',attr:null, text:'ID'},
                        'tag_de':{id:'tag_de', class:'tag sortable th-filter',attr:{'data-priority':'1'}, text:dict.tag+' (de)'},
                        'tag_en':{id:'tag_en', class:'tag sortable th-filter',attr:{'data-priority':'3'}, text:dict.tag+' (en)'},
                        'action':{id:'action', class:null, attr:null,text:dict.act}
                        };
        
        widget.refresh();
    },

    _getTagsItem: function(_itemid){
        var widget = this;
        $('#'+widget.options.tableName+'form').find('.has-error').removeClass('has-error');
        $('div.card-heading').hide(); 
        
        sendRequest({
            action: 'basic.gettagsitem',
            data: {itemid: _itemid,tablename:widget.options.tableName},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    var item = response.data.item[0];
                    // var itemsimg = response.data.itemsimg;
                    var form = $('div#'+widget.options.tableid+'form').attr('data-id', _itemid);
                    form.find('.modal-title').text(widget.options.dict.edit+' '+widget.options.dict.tags+' #'+_itemid);
                    form.find('span.error-form').text('');
                    form.removeClass('additemsform itemsform-hidden').addClass('edititemsform itemsform-visible');
                    var dataStr = item.data;
                    $('#tagsform #datastr').val(dataStr);

                    var tagde = item.tag_de;
                    var tagen = item.tag_en;
                    form.find('#inputtagde').val(tagde);
                    form.find('#inputtagen').val(tagen);
                    widget._decomposeDataStr();

                    $('#footer').empty().append(
                        $('<button/>', {class: 'btn btn-primary save-item', type:'submit'}).text(widget.options.dict.save),
                        $('<button/>', {class: 'btn btn-default cancel-edit', type:'button'}).text(widget.options.dict.cancel)
                    );

                }
            }
            
        });
        
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
        
        widget.options.tbody.empty();
        
        for (var i = startrow; i < finishrow; i++) {
            var item = items[i];
            var tagde = item.tag_de;           
            var tagen = item.tag_en;
            $('<tr/>', {'data-id': item.id, class:'expanded'}).append(
                $('<td/>').text(item.id),
                $('<td/>', {class: 'tag_de'}).text(tagde),
                $('<td/>', {class: 'tag_en'}).text(tagen),
                $('<td/>', {class: 'act'}).append(acttd)
            ).appendTo(widget.options.tbody);
        }
    },

    createItemsForm:function(){
        var widget = this;
        
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
                    if ($('#'+widget.options.tableId+'form').length == 0) {
                        $('div.card').append(
                            $('<div/>', {class:'additemsform itemsform-hidden', id:widget.options.tableId+'form'}).append(
                                $('<div/>',{class:'itemsform-dialog'}).append(
                                    $('<div/>',{class:'itemsform-content'}).append(
                                        $('<div/>',{class:'modal-header'}).append(
                                            $('<h4/>', {class:'modal-title'}).text(widget.options.dict.create+' '+widget.options.dict[widget.options.tableId])
                                        ),
                                        $('<div/>',{class:'modal-body'}).append(
                                            $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                                $('<div/>',{class:'row'}).append(
                                                    $('<div/>',{class:'col-sm-6'}).append(
                                                        $('<div/>',{class:'col-sm-offset-2 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputtagde').text(widget.options.dict.tag+' (de)'),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<input/>',{class:'form-control', type:'text', id:'inputtagde'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.tag+' (de)'),
                                                                    $('<span/>',{class:'error-form'})
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-2 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label required'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputtagen').text(widget.options.dict.tag+' (en)'),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<input/>',{class:'form-control', type:'text', id:'inputtagen'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.tag+' (en)'),
                                                                    $('<span/>',{class:'error-form'})
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-2 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputkeywords').text(widget.options.dict.keywords),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<input/>',{class:'form-control', type:'text', id:'inputkeywords'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.keywords),
                                                                    $('<span/>',{class:'error-form'})
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-2 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputcategory').text(widget.options.dict.category),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputcategory'}).append(
                                                                        $('<option/>').text('All').val('-1')
                                                                    )
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-2 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputagefrom').text(widget.options.dict.age),
                                                                $('<label/>',{class:'control-label col-md-2 label-f-t'}).attr('for','inputagefrom').text(widget.options.dict.from),
                                                                $('<div/>',{class:'col-md-4'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputagefrom'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                ),
                                                                $('<label/>',{class:'control-label col-md-2 label-f-t'}).attr('for','inputageto').text(widget.options.dict.to),
                                                                $('<div/>',{class:'col-md-4'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputageto'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-2 col-sm-9'}).css('display','none').append(
                                                           $('<div/>',{class:'col-sm-12'}).append(
                                                                $('<input/>',{class:'form-control', type:'text', id:'datastr'})
                                                            )
                                                        )
                                                    ),
                                                    
                                                    $('<div/>',{class:'col-sm-6'}).append(
                                                        $('<div/>',{class:'col-sm-offset-1 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputprice').text(widget.options.dict.pricerange),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputprice'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1'),
                                                                        $('<option/>').text('0 (on request)').val('0')
                                                                    ),
                                                                    $('<span/>',{class:'error-form'})
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-1 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputlevelfrom').text(widget.options.dict.level),
                                                                $('<label/>',{class:'control-label col-md-2 label-f-t'}).attr('for','inputlevelfrom').text(widget.options.dict.from),
                                                                $('<div/>',{class:'col-md-4'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputlevelfrom'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                ),
                                                                $('<label/>',{class:'control-label col-md-2 label-f-t'}).attr('for','inputlevelto').text(widget.options.dict.to),
                                                                $('<div/>',{class:'col-md-4'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputlevelto'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-1 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputsuccessfrom').text(widget.options.dict.successfulto),
                                                                $('<label/>',{class:'control-label col-md-2 label-f-t'}).attr('for','inputsuccessfrom').text(widget.options.dict.from),
                                                                $('<div/>',{class:'col-md-4'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputsuccessfrom'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                ),
                                                                $('<label/>',{class:'control-label col-md-2 label-f-t'}).attr('for','inputsuccessto').text(widget.options.dict.to),
                                                                $('<div/>',{class:'col-md-4'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputsuccessto'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('1-')
                                                                    )
                                                                )
                                                            )
                                                        ),
                                                        
                                                        $('<div/>',{class:'col-sm-offset-1 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputcolor').text(widget.options.dict.color),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputcolor'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                )
                                                            )
                                                        ),
                                                        $('<div/>',{class:'col-sm-offset-1 col-sm-9'}).append(
                                                            $('<div/>',{class:'form-group responsive-label'}).append(
                                                                $('<label/>',{class:'control-label col-sm-12 align-left'}).attr('for','inputsex').text(widget.options.dict.sex),
                                                                $('<div/>',{class:'col-sm-12'}).append(
                                                                    $('<select/>',{class:'form-control', id:'inputsex'}).append(
                                                                        $('<option/>').text(widget.options.dict.any).val('-1')
                                                                    )
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    ),
                                    $('<div/>', {class:'modal-footer col-xs-11', id:'footer'}).append(
                                        $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.create),
                                        $('<button/>', {class: 'btn btn-default cancel-add', type:'button'}).text(widget.options.dict.cancel)
                                    )
                                )
                            )
                        )
                        var inputCategory = $('select#inputcategory');
                        for (var i = 0; i < widget.options.horsesCategoryKey.length; i++) {
                            inputCategory.append(
                                $('<option/>').text(widget.options.dict[widget.options.horsesCategoryKey[i]]).val(i)
                            )
                        };
                        inputCategory.find('option')[1].setAttribute('selected','selected');
                        var inputAgeFrom = $('select#inputagefrom');
                        var inputAgeTo = $('select#inputageto');
                        
                        for (var j = 0; j < 31; j++) {
                            inputAgeFrom.append(
                                $('<option/>').text(j).val(j)    
                            );
                            inputAgeTo.append(
                                $('<option/>').text(j).val(j)    
                            );
                        };
                        var inputPrice = $('select#inputprice');
                        for(var key in widget.options.horsesPrices){
                            var priceObj = widget.options.horsesPrices[key];
                            if (priceObj['less_more'] == '0') {
                                inputPrice.append(
                                    $('<option/>').text('less_than '+priceObj['price']).val(priceObj['id'])
                                )
                            }else{
                                inputPrice.append(
                                    $('<option/>').text('more_than '+priceObj['price']).val(priceObj['id'])
                                )
                            }
   
                        };
                        var inputLevelFrom = $('select#inputlevelfrom');
                        var inputLevelTo = $('select#inputlevelto');
                        var inputSuccessFrom = $('select#inputsuccessfrom');
                        var inputSuccessTo = $('select#inputsuccessto');
                        for (var q = 0; q < widget.options.horsesLevel.length; q++) {
                            inputLevelFrom.append(
                                $('<option/>').text(widget.options.horsesLevel[q]).val(q)
                            );
                            inputLevelTo.append(
                                $('<option/>').text(widget.options.horsesLevel[q]).val(q)
                            );
                            inputSuccessFrom.append(
                                $('<option/>').text(widget.options.horsesLevel[q]).val(q)
                            );
                            inputSuccessTo.append(
                                $('<option/>').text(widget.options.horsesLevel[q]).val(q)
                            )
                            
                        };
                        var inputColor = $('select#inputcolor');
                        for (var k = 0; k < widget.options.horsesColor.length; k++) {
                            inputColor.append(
                                $('<option/>').text(widget.options.dict[widget.options.horsesColor[k]]).val(k)
                            )
                            
                        };

                        var sex = widget.options.sexesen;
                        if (widget.options.lang == 'de') sex = widget.options.sexesde;
                        var inputSex = $('select#inputsex');
                        for (var n = 0; n < sex.length; n++) {
                            inputSex.append(
                                $('<option/>').text(sex[n]).val(n)
                            )
                        }
                    }
                }
            }
        });
    },

    _decomposeDataStr:function(){
        var widget = this;
        var form = $('#'+widget.options.tableId+'form');
        var dataStr = $('#tagsform #datastr').val();
        dataStr = dataStr.split(/;/);
        if (dataStr.length > 1) {
            for (var i = 0; i < dataStr.length; i++) {
                dataStr[i] = $.trim(dataStr[i]);
            };
            var keyWords = dataStr[1].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var category = dataStr[3].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var ageFrom = dataStr[5].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var ageTo = dataStr[7].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var priceId = dataStr[9].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var levelFrom = dataStr[11].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var levelTo = dataStr[13].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var successFrom = dataStr[15].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var successTo = dataStr[17].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var colorId = dataStr[19].slice(dataStr[1].lastIndexOf(':')+2, -1);
            var sexId = dataStr[21].slice(dataStr[1].lastIndexOf(':')+2, -2);
            
            form.find('#inputkeywords').val(keyWords);
            form.find('#inputcategory').val(category);
            form.find('#inputagefrom').val(ageFrom);
            form.find('#inputageto').val(ageTo);
            form.find('#inputprice').val(priceId);
            form.find('#inputlevelfrom').val(levelFrom);
            form.find('#inputlevelto').val(levelTo);
            form.find('#inputsuccessfrom').val(successFrom);
            form.find('#inputsuccessto').val(successTo);
            form.find('#inputcolor').val(colorId);
            form.find('#inputsex').val(sexId);
        };
    },

    _collectDataStr:function(){
        var widget = this;
        var keyWords = $('#inputkeywords').val();
        var category = $('select#inputcategory').val();
        var ageFrom = $('select#inputagefrom').val();
        var ageTo = $('select#inputageto').val();
        var price = $('select#inputprice').val();
        var successFrom = $('select#inputsuccessfrom').val();
        var successTo = $('select#inputsuccessto').val();
        var levelFrom = $('select#inputlevelfrom').val();
        var levelTo = $('select#inputlevelto').val();
        var sex = $('select#inputsex').val();
        var color = $('select#inputcolor').val();

        var dataString = 'a:11:{s:4:"name";s:'+keyWords.length+':"'+keyWords+'";';
        dataString +='s:11:"category_id";s:'+category.length+':"'+category+'";s:8:"age_from";';
        dataString += 's:'+ageFrom.length+':"'+ageFrom+'";s:6:"age_to";s:'+ageTo.length+':"'+ageTo+'";';
        dataString += 's:8:"price_id";s:'+price.length+':"'+price+'";s:10:"level_from";';
        dataString += 's:'+levelFrom.length+':"'+levelFrom+'";s:8:"level_to";';
        dataString += 's:'+levelTo.length+':"'+levelTo+'";s:15:"successful_from";';
        dataString += 's:'+successFrom.length+':"'+successFrom+'";s:13:"successful_to";';
        dataString += 's:'+successTo.length+':"'+successTo+'";s:5:"color";s:'+color.length+':"'+color+'";';
        dataString += 's:3:"sex";s:'+sex.length+':"'+sex+'"}';
        var form = $('#'+widget.options.tableId+'form');
        form.find('#datastr').val(dataString);
        return dataString;

    },
    
    clearForm:function(){
        var widget = this;
        var form = $('div#'+widget.options.tableId+'form').attr('data-id','');
        form.find('span.error-form').text('');
        var newItemObj = widget.options.fieldsForChange;
        for(var key in newItemObj){
            var address = newItemObj[key].address;
            if (newItemObj[key].tinymce) {
                tinyMCE.get(address).setContent('');
            }else{
                form.find(address).val('');
            };
        };
        form.find('#inputkeywords').val('');
        form.find('#inputcategory').val('');
        form.find('#inputagefrom').val('');
        form.find('#inputageto').val('');
        form.find('#inputprice').val('');
        form.find('#inputlevelfrom').val('');
        form.find('#inputlevelto').val('');
        form.find('#inputsuccessfrom').val('');
        form.find('#inputsuccessto').val('');
        form.find('#inputcolor').val('');
        form.find('#inputsex').val('');
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
