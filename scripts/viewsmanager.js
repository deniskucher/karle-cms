/**
* Views Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.10
*/
$.widget('nm.viewsmanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'views',
        tableSettings:null,
        thobject:null,
        tdobject:null,
        thtoggle:'',
        toggleCount:null,
        managerBarHidden:['.additems'],
        refreshTableHandler:'basic.gethorses',

        horsesCategoryDe:['Springpferde','Dressurpferde','Spring- und Dressurpferde','Fohlen','Zuchtstuten','Deckhengste','Erfolgspferde','Hunters'],
        horsesCategoryEn:['Jumpers','Dressage Horses','Jumpers + Dressage Horses','Foals','Breeding Mares','Stallions','Successful Horses','Hunters'],

        viewsObjFromSer:{}
         
    },
    

    _create: function () {
        var widget = this;
        
        this.element.on('click','.switch-lang button',function(e){
            e.preventDefault();
            widget.changeLang($(this));
        });

        this.element.on('mouseover','#views th', function(){
            $(this).find('span.fooicon').css('opacity','1');
        });

        this.element.on('mouseout','#views th', function(){
            $(this).find('span.fooicon').css('opacity','0');
        });

        this.element.on('click','#views th.sortable', function(){
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
            widget.refreshTable($('.searchfield').val(), 'basic.gethorsesviews');
        });

        this.element.on('keypress', '.searchfield', function (e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                e.preventDefault();
                widget.refreshTable($(this).val(), 'basic.gethorsesviews');
            }
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
        widget.options.tableSettings = {id: 'views', class:'table table-condensed',
                            attr:{'data-paging-size':'5','data-paging-limit':'2'},
                            };
        widget.options.thobject = {'id':{id:'id', class:'sortable th-filter',attr:null, text:'ID'},
                        'category':{id:'category', class:'category sortable th-filter switchlang',attr:{'data-priority':'3', 'data-lang':'de'},text:dict.category},
                        'category_en':{id:'category_en', class:'category sortable th-filter switchlang',attr:{'data-priority':'3','data-lang':'en'}, text:dict.category+' (en)'},
                        'name':{id:'name', class:'name sortable th-filter',attr:{'data-priority':'2'}, text:dict.name},
                        'views':{id:'views', class:'views sortable',attr:{'data-priority':'1'}, text:dict.views}
                        };
        widget._getViews();
                   
    },

    displayTableData:function(startrow, finishrow){
    	var widget = this;
    	var items = widget.options.items;
    	widget.options.tbody.empty();
        
        var viewsObj = {};
        var horseIdPr = '';
        for(var key in widget.options.viewsObjFromSer){
            var horseId = widget.options.viewsObjFromSer[key].horse_id;
            (horseIdPr == horseId)? viewsObj[horseId] += +widget.options.viewsObjFromSer[key].views : viewsObj[horseId] = +widget.options.viewsObjFromSer[key].views;
            horseIdPr = horseId;
        }
 
        for (var i = startrow; i < finishrow; i++) {
            var item = items[i];
            var name = item.name;
            var categoryId = item.category_id;

            var categoryDe = widget.options.horsesCategoryDe[categoryId];
            var categoryEn = widget.options.horsesCategoryEn[categoryId];
            var views = viewsObj[item.id];
            
            $('<tr/>', {'data-id': item.id, class:'expanded'}).append(
                $('<td/>').text(item.id),
                $('<td/>', {class: 'switchlang category'}).text(categoryDe).attr('data-lang','de'),
                $('<td/>', {class: 'switchlang category'}).text(categoryEn).attr('data-lang','en'),
                $('<td/>', {class: 'name'}).text(name),
                $('<td/>', {class: 'views'}).text(views)
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
                                
                            ),
                            $('<div/>', {class:'modal-footer col-sm-11 col-lg-10', id:'footer'}).append(
                                $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.create),
                                $('<button/>', {class: 'btn btn-default cancel-add', type:'button'}).text(widget.options.dict.cancel)
                            )
                        )
                    )
                )
            )
            
        }
    },

    _getViews: function(){
        var widget = this;
        
        sendRequest({
            action: 'basic.getviews',
            data: {},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.options.viewsObjFromSer = response.data.viewsobj;
                    widget.refresh();
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
