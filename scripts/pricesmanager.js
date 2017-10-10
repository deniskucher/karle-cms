/**
* Price Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.09
*/
$.widget('nm.pricesmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'prices',
        tableSettings:null,
        thobject:null,
        tdobject:null,
        thtoggle:'',
        togglecount:null,
        
        fieldsForChange:{price:{address:'#inputprice',required:true},
                        less_more:{address:'#inputless_more'}
                        },

        refreshTableHandler:'basic.getprices',
        lessMore:['<','>']
         
    },
    

    _create: function () {
        var widget = this;
        
        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });

        this.element.on('mouseover','#prices th', function(){
            $(this).find('span.fooicon').css('opacity','1');
        });
        this.element.on('mouseout','#prices th', function(){
            $(this).find('span.fooicon').css('opacity','0');
        });

        this.element.on('click','#prices th.sortable', function(){
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
            $('div.additemsform').removeClass('itemsform-hidden').addClass('itemsform-visible');
            // setTimeout(function() {widget._tinymceinit()});

        });
        this.element.on('click','div#pricesform button.cancel-add', function(){
            $('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
        });

        this.element.on('click','div#pricesform .senddataonserver', function(e) {
            widget.createItem(widget.options.fieldsForChange, 'basic.createprices');
        });

        this.element.on('click', '.edit-item', function(e) {
            e.preventDefault();
            widget._getPriceItem($(this).closest('tr').data('id'));
        });
        this.element.on('click','div#pricesform .save-item', function(e) {
            e.preventDefault();
            e.stopPropagation();
            widget.updateItem();
        });

        this.element.on('click','div#pricesform button.cancel-edit', function(){
            $('div.edititemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
            $('div.card-heading').show();
            widget.clearForm();
        });

        this.element.on('click', '.delete-item', function(e) {
            if(confirm(widget.options.dict.remove+' '+widget.options.dict[widget.options.tableName]+'?')){
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
        
        $('body').on('focus', 'div#pricesform .modal-body input[type=text]', function() {
            $(this).next().hide();
        });
        $('body').on('blur', 'div#pricesform .modal-body input[type=text]', function() {
            if ($(this).val()=='') $(this).next().show();
        });
        this._drawTable();
    },
	
	_drawTable: function () {
        var widget = this;
        
        var dict = widget.options.dict;
        widget.options.tableSettings = {id: 'prices', class:'table table-condensed',
                            attr:{'data-paging-size':'5','data-paging-limit':'2'},
                            };
        widget.options.thobject = {'id':{id:'id', class:'sortable th-filter',attr:null, text:'ID'},
                        'price':{id:'price', class:'price sortable th-filter',attr:{'data-priority':'6', 'data-sort':'val'},text:dict.prices},
                        'action':{id:'action', class:null, attr:null,text:dict.act}
                        };
        
        widget.refresh();
        
                    
    },
    
    displayTableData:function(startRow, finishRow){
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
        
        for (var i = startRow; i < finishRow; i++) {
            var item = items[i];
            var lessMoreArr = widget.options.lessMore;
            var price = item.price;
            var priceFormat = widget.formatMoney(price, ',');
            var lessMore = lessMoreArr[item.less_more];
            
            $('<tr/>', {'data-id': item.id, class:'expanded'}).append(
                $('<td/>').text(item.id),
                $('<td/>', {class: 'price'}).text(lessMore+' '+priceFormat+' '+'EUR').val(price+item.less_more),
                $('<td/>', {class: 'act'}).append(acttd)
                
            ).appendTo(widget.options.tbody);
        }
    },
    createItemsForm:function(){
        var widget = this;
        
        if ($('#'+widget.options.tableid+'form').length == 0) {
            $('div.card').append(
                $('<div/>', {class:'additemsform itemsform-hidden', id:widget.options.tableid+'form'}).append(
                    $('<div/>',{class:'itemsform-dialog'}).append(
                        $('<div/>',{class:'itemsform-content'}).append(
                            $('<div/>',{class:'modal-header'}).append(
                                // $('<button/>', {class:'close', type:'button'}).attr('data-dismiss','modal').html('&#215;'),
                                $('<h4/>', {class:'modal-title'}).text(widget.options.dict.create+' '+widget.options.dict[widget.options.tableid])
                            ),
                            $('<div/>',{class:'modal-body'}).append(
                                $('<form/>', {class:'form-horizontal', role:'form'}).append(
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputprice').text(widget.options.dict.prices),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<input/>',{class:'form-control', type:'text', id:'inputprice'}).attr('placeholder', widget.options.dict.input+' '+widget.options.dict.prices),
                                            $('<span/>',{class:'error-form'})
                                        )
                                    ),
                                    $('<div/>',{class:'form-group responsive-label required'}).append(
                                        $('<label/>',{class:'col-sm-3 control-label'}).attr('for','inputless_more').text(widget.options.dict.less+'/'+widget.options.dict.more),
                                        $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                                            $('<select/>',{class:'form-control', id:'inputless_more'}).append(
                                                $('<option/>').text(widget.options.dict.less).val('0'),
                                                $('<option/>').text(widget.options.dict.more).val('1')
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
            )
            
        }
    },
    _getPriceItem: function(_itemid){
        var widget = this;
        $('#'+widget.options.tableName+'form').find('.has-error').removeClass('has-error');
        $('div.card-heading').hide(); 
        
        sendRequest({
            action: 'basic.getpriceitem',
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
                    form.find('.modal-title').text(widget.options.dict.edit+' '+widget.options.dict.price+' #'+_itemid);
                    form.find('span.error-form').text('');
                    form.removeClass('additemsform itemsform-hidden').addClass('edititemsform itemsform-visible');

                    var itemobj = widget.options.fieldsForChange;
                        for(var key in itemobj){
                            var address = itemobj[key].address;
                            form.find(address).val(item[key]);
                        };

                    $('.modal-footer').empty().append(
                        $('<button/>', {class: 'btn btn-primary save-item', type:'submit'}).text(widget.options.dict.save),
                        $('<button/>', {class: 'btn btn-default cancel-edit', type:'button'}).text(widget.options.dict.cancel)
                    );

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
