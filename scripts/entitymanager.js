/**
* Entity Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @created 2017.02.09
*/
$.widget('dk.entitymanager', {

    options: {
        dummy: 'dummy',
        manager: null,
        tbody: null,
        thtoggle:'',
        toggleCount:null,
        items:null,
        currentPageInTable:1,
        pagingSize:5,
        pagingSizeArr: [5,10,50,100],
        contentLang:null,
        managerBarHidden:null,
        uploadImgDirObj : {
                    // 'original':{'address':'/uploads/tinymce/original/', 'width':'900'},
                    'thumbs':{'address':'uploads/tinymce/thumbs/', 'width':'180'}
                },
        fbAccesToken:null,
        fbPostData:{} 
        
    },
    
    _create: function () {
        var widget = this;
 
    },
	
	refresh: function () {
        var widget = this;
        
        widget.refreshTable($(this).serializeObject());
        
        // setTimeout(function() {widget.element.find('form input[name=query]').focus()});
    },
    
    drawManagerBar:function(){
        var widget = this;
        widget.options.manager = widget.element.find('.card-heading');
        var managerwrap = $('div.manager-wrap');
        if (managerwrap.length == 0) {
            widget.options.manager.append(
                $('<div/>', {class:'manager-wrap'}).append(
                    $('<form/>', {id: 'search', class:'form-inline'}).append(
                        $('<button/>', {class: 'btn btn-primary additems', type:'button'}).attr('data-toggle','modal').text('+'),
                        $('<div/>',{class:'btn-group switch-lang'}).append(
                            $('<button/>',{class:'btn btn-primary'}).attr('data-language','de').text('DE'),
                            $('<button/>',{class:'btn btn-primary'}).attr('data-language','en').text('EN')
                        ),
                        $('<div/>',{class:'search-field'}).append(
                            $('<div/>',{class: 'form-group'}).append(
                                $('<div/>',{class: 'input-group'}).append(
                                    $('<input/>',{type:'text', class:'searchfield form-control placeholder', name:'query'}).attr('placeholder', widget.options.dict.search_placeholder),
                                    $('<span/>', {class:'remove-search fooicon glyphicon glyphicon-remove'}).css('display','none'),
                                    $('<div/>',{class:'input-group-btn'}).append(
                                        $('<button/>',{type:'button', class:'btn btn-primary search'}).append(
                                            $('<span/>', {class:'fooicon glyphicon glyphicon-search search'})
                                        )   
                                    )
                                )
                            )
                        )
                    )
                )
            );
        };
        widget._deleteModuleManagerBar();

    },

    _deleteModuleManagerBar:function(){
        var widget = this;
        var hideManagerBar = widget.options.managerBarHidden || null;
        if(hideManagerBar){
            for (var i = 0; i < hideManagerBar.length; i++) {
                   $(hideManagerBar[i]).css("display","none"); 
               };   
        };
        widget.options.managerBarHidden = null;
        
    },
    
    refreshTable: function (_data) {
        var widget = this;
        var tableName = widget.options.tableName;
        $('.usernotfound').remove();
        widget.options.manager = widget.element.find('.card-heading');
        var columnForSearchMass = widget._searchByField();
        
        sendRequest({
            action: widget.options.refreshTableHandler,
            data: {query: _data, search: columnForSearchMass, tablename: tableName},
            successHandler: function(_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success){
                    widget.drawManagerBar();
                    $('table#'+widget.options.tableid+'>tbody').remove();
                    $('#'+widget.options.tableid+'-navigation').remove();
                    $('<div/>', {class: 'usernotfound'}).append(
                        $('<p/>').text(widget.options.dict.datadontfound)
                    ).insertAfter('table#'+widget.options.tableid);
                } 
                else {
                    widget.drawManagerBar();
                    $('#'+widget.options.tablename+'form').find('.has-error').removeClass('has-error');
                    var data = response.data;
                    widget.options.responsedata = data;
                    widget.options.items = data.tabledata;
                    
                    widget.selectViewAs(widget.options.view);

                }

                widget.createItemsForm();
            }
        });
    
    },

    drawTableThead:function(){
    	var widget = this;
        var tableSettings = widget.options.tableSettings;
        var thobject = widget.options.thobject;
        widget.options.tableid = tableSettings.id;
        if (widget.options.items && widget.options.items.length) {
            
            $('#'+widget.options.tableid).remove();
            $('#'+widget.options.tableid+'-navigation').remove();
            $('div.table-respons').remove();
            
            $('<div/>', {class: 'table-respons'}).append(
                $('<table/>', {id: widget.options.tableid, class: tableSettings.class}).attr(tableSettings.attr).append(
                    $('<thead/>').append(
                        $theadtr = $('<tr/>')
                    ),
                    widget.options.tbody = $('<tbody/>'),
                    $('<tfoot/>')
                )
            ).appendTo(widget.options.manager);
            
        };
        for (var key in thobject) {
            $theadtr.append(
                $('<th/>', {id:thobject[key].id, class:thobject[key].class}).attr(thobject[key].attr).text(thobject[key].text)
            )    
        };
        $('.sortable').append(
            $('<span/>',{class:'fooicon fooicon-sort'})
        );
    },

    clearForm:function(){
    	var widget = this;
    	var form = $('div#'+widget.options.tableid+'form').attr('data-id','');
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
        form.find('.gallery-data').empty();
        form.find('.has-error').removeClass('has-error');
        widget.clearPreviewPhoto();
    },
    
    clearPreviewPhoto:function(){
        var widget = this;
        widget.element.find('.qq-file-info').empty();
    },

    addItemsForm:function(){
        var widget = this;
        var form = $('div#'+widget.options.tableid+'form').attr('data-id','');
        widget.addOptionSendToFacebook(widget.element.find('#footer'));
        form.find('.modal-title').text(widget.options.dict.create+' '+widget.options.dict[widget.options.tableName]);
        form.find('.onlyforcreate').show();     // used in pagesmanager (Meta keywords de,en; Meta description de,en)
        form.find('.onlyforedit').hide();       // used in pagesmanager (Meta keywords de,en; Meta description de,en)
        widget.changeModalFooter(true);
        form.removeClass('edititemsform itemsform-hidden').addClass('additemsform itemsform-visible');
    },

    changeModalFooter:function(_create){
        var widget = this;
        var modalfooter = widget.element.find('#footer');
        if (_create) {
            modalfooter.find('button:eq(0)').removeClass().addClass('btn btn-primary senddataonserver').text(widget.options.dict.create);
            modalfooter.find('button:eq(1)').removeClass().addClass('btn btn-default cancel-add').text(widget.options.dict.cancel);
            
        }else{
            modalfooter.find('button:eq(0)').removeClass().addClass('btn btn-primary save-item').text(widget.options.dict.save);
            modalfooter.find('button:eq(1)').removeClass().addClass('btn btn-default cancel-edit').text(widget.options.dict.cancel);
        }
        
    },
    
    deleteItem: function (_id, _refreshself) {
        var widget = this;
        var tableName = widget.options.tableName;
        if (_refreshself) tableName = widget.options.tableNamePhoto;
        sendRequest({
            action: 'basic.deleteitem',
            data: {itemid: _id, tablename: tableName},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.element.find('tr[data-id='+_id+']').remove();
                    if (_refreshself) {
                        widget.refreshSelf();
                    }else{
                        widget.refreshTable();
                    }
                    
                }
            }
        });
    },

    selectViewAs: function(view){
        var widget = this;
        if((view == 'table') || (!view)) widget.drawAsTable();      
        if (view == 'gallery') widget.drawAsGallery();
    },

    drawAsTable: function(){
        var widget = this;
        widget.drawTableThead();
        widget.addNavigationTable();
        widget.drawRowsInTable();
        widget.selectLanguage();
        setTimeout(function() {widget.tinymceInit()},50);
    },

    drawAsGallery: function(){
        var widget = this;
        widget.drawBlocks();
        // widget.addNavigationTable();
        widget.selectLanguage();
        widget._switchLang();
        widget.calcHeightGalleryLi(widget.element.find('li.gallery-list'));
    },

    drawBlocks:function(){
        var widget = this;
        
        if (widget.options.items && widget.options.items.length) {
            
            $('.gallery-block').remove();
            widget.options.manager.append(
                $('<div/>',{class:'gallery-block'}).append(
                    $gallery = $('<ul/>', {class: 'gallery-data row', id:'gallery-'+widget.options.managerId}),
                    $('<div/>', {class:'ripple'}),
                    $('<div/>',{class:'row manager-footer'})
                )
                  
            );
            
            widget.drawBlocksContent();
        };
    },
    
    addOptionSendToFacebook:function(_prependTo){
        var widget = this;
        widget.element.find('#send_to_fb').remove();
        if (widget.options.fbsettings.facebook == 'yes'){
            _prependTo.prepend(
                $('<label/>',{class:'control-label', id:'send_to_fb'}).text(widget.options.dict.sendtofb+':').append(
                    $inp = $('<input/>',{type:'checkbox', id:'inputsendtofb'})
                )
            );
            _prependTo.append(
                $('<div/>',{id:'send_to_fb_err'})
            );
            widget.setCheckSendToFb();
            
        }
    },

    makeResponsive: function(){
        var widget = this;
        $('#'+widget.options.tableid).addClass('table table-condensed tablemanager table-stripe ui-responsive ui-table ui-table-columntoggle table-details');
        var rowCount = $('#'+widget.options.tableid+' >tbody >tr').length;
        
        $('#'+widget.options.tableid+' th').each( function(){
            var priority = $(this).data('priority');
            var index = $(this).index();
            $(this).addClass('ui-table-priority-'+priority);
            var $tr = $('#'+widget.options.tableid+'>tbody>tr');
            for (var i = 0; i < rowCount; i++) {
                var td = $tr.children().eq(index);
                td.addClass('ui-table-priority-'+priority);
                $tr = $tr.next();
            };
        });
        widget.resizeView();
       
    },
    
    resizeView: function(){
        var widget = this;
        var th = $('#'+widget.options.tableid+' th:not(.td-hidden)');
        var trbody = $('#'+widget.options.tableid+'>tbody>tr');
        var fooicon = false;
        for (var i = 0; i < th.length; i++) {
            if (window.getComputedStyle(th[i]).display == 'none') fooicon = true;
        }
        if (fooicon) {
            for (var j = 0; j < trbody.length; j++) {
                
                if (trbody[j].children[0].childElementCount == 0) {
                    var trdataid = trbody[j].getAttribute('data-id');
                    $('<span/>',{class:'footable-toggle fooicon-details fooicon-plus'}).prependTo(trbody[j].children[0]);
                }
            }
        }else{
            $('span.fooicon-details').remove();
            }
        widget.showDetailRows(); 
    },
    
	showDetailRows: function(){
        var widget = this;
        var th = $('#'+widget.options.tableid+' thead th');
        var hideTdArr = {};
        var colHiddenTd = 0;
        
        for (var i = 0; i < th.length; i++) {
            if (window.getComputedStyle(th[i]).display == 'none') {
                var temp = {};
                temp['index']=i;
                colHiddenTd++;
                
                if (th[i].classList.contains('td-hidden')) {
                     temp['td-hidden'] ='true';
                }
                hideTdArr[i] = temp;
                delete temp;
            }
        }
        var $tr = $('#'+widget.options.tableid+' tbody>tr.expanded');
        var rowCount = $tr.length;
        for (var n = 0; n < rowCount; n++) {
            
            if (($target = $tr[n].children[0].children[0]) && $target.classList.contains('fooicon-minus')) {
                var nexttr = $tr[n].nextSibling;
                if (nexttr && nexttr.classList.contains('footable-detail-row')) $tr[n].nextSibling.remove();
                
                var rowid = $tr[n].getAttribute('data-id');
                var colspan = th.length - colHiddenTd + 1;
                $('<tr/>',{class:'footable-detail-row'}).attr('data-id', rowid).append(
                    $('<td/>',{colspan: colspan}).append(
                        $('<table/>',{class:'footable-details table'}).attr('data-details-id', rowid).append(
                            $('<tbody/>')
                        )
                    )
                ).insertAfter($('#'+widget.options.tableid+' tbody>tr[data-id='+rowid+']'));
                
                for(var k in hideTdArr){
                    var index = k;
                    var headText = th[index].innerText;
                    var classSwitchLang = th[index].classList.contains('switchlang');
                    (classSwitchLang)? classSwitchLang = 'switchlang': classSwitchLang = '';
                    var lang = th[index].getAttribute('data-lang');
                    var hideTd = $tr[n].children[index];
                    var hideTdLenght = hideTd.children.length;
                    $tableDetails = $('table.footable-details[data-details-id='+rowid+']>tbody').append(
                        $trDetails = $('<tr/>',{class:'detail td-visible'}).attr('data-id',rowid).append(
                            $('<th/>',{class:classSwitchLang}).attr('data-lang',lang).text(headText),
                            hideTd.outerHTML
                        )
                    )
                    if (hideTdLenght > 0) {
                        $trDetails.html('');
                        $trDetails.append(
                            $('<th/>',{class: 'lang-'+lang}).text(headText),
                            hideTd.children[0].outerHTML
                        );
                        for (var l = 1; l < hideTdLenght; l++) {
                           
                           $tableDetails.append(
                                $('<tr/>',{class:'detail td-visible'}).attr('data-id',rowid).append(
                                    $('<th/>').text(''),
                                    hideTd.children[l].outerHTML
                                )
                            ) 
                        }
                    }
                    
                }
            }
            var d = $('#'+widget.options.tableid+' span.fooicon-details');
            if ($('#'+widget.options.tableid+' span.fooicon-details').length <1) $('#'+widget.options.tableid+' tbody>tr.footable-detail-row').remove(); 
            
        }
        widget._switchLang();
    },

    sortTable: function(_column){
        var widget = this;
        var $tr = $('#'+widget.options.tableid+'>tbody>tr.expanded');
        var rowCount = $tr.length;
        var items = [];
        var index = $(_column).index();
        
        for (var i = 0; i < rowCount; i++) {
            var key = $tr.data('id');
            var usersobjval;
            // items.push(key);
            
            if (_column.data('select') == true) {
                usersobjval = $tr.children().eq(index).children().val();
            }
            else if (_column.attr('data-id') == 'date') {
                usersobjval = $tr.children().eq(index).val();
            }
            else if(_column.attr('data-sort') == 'val'){
                usersobjval = $tr.children().eq(index).val();
            }
            else{
                usersobjval = $tr.children().eq(index).text();
            }
                        
            $tr = $tr.next();
            items[i] = {val: usersobjval, id: key};
            
        }
        
        if ((_column.attr('id') == 'id') || (_column.attr('age') == 'age')) {
            items.sort(widget._sorterNumber);
        }else if(_column.attr('id') == 'price'){
            items.sort(widget._sorterPrice);
        }
        else {
            items.sort(widget._sorterString);
        }
        
        for (var k = 0; k < items.length; k++) {
            
            $('#'+widget.options.tableid+'>tbody>tr[data-id='+items[k].id+']').appendTo($('#'+widget.options.tableid));
            
        };
        
        
    },
   
    drawRowsInTable: function(_currentpagenum) {
        var widget = this;
        var items = widget.options.items;
        var pagingSize = $('table#'+widget.options.tableid).attr('data-paging-size');
        if (!pagingSize) pagingSize = items.length;
        var lastPage = Math.ceil(widget.options.items.length/pagingSize);
        var limitPage = $('table#'+widget.options.tableid).data('paging-limit');
        var numPagingPage = widget.options.currentPageInTable;
        if (numPagingPage>lastPage) numPagingPage = lastPage;
        if (_currentpagenum) numPagingPage = _currentpagenum;
        
        if (numPagingPage == 'first') numPagingPage = 1;
        if (numPagingPage == 'prev') numPagingPage = widget.options.currentPageInTable - 1;
        if (numPagingPage == 'last') numPagingPage = lastPage;
        if (numPagingPage == 'next') numPagingPage = widget.options.currentPageInTable + 1;
        if ((numPagingPage == 'next-limit') || (numPagingPage == 'prev-limit')) numPagingPage = widget.options.currentPageInTable;
        var currentLi = $('.pagination li.page-nav[data-page = '+numPagingPage+']');
        $('.pagination li.page-nav').removeClass('active');
        
        if (!currentLi.hasClass('visible')) {
            var numPageDeleteLeft = numPagingPage-limitPage;
            var numPageDeleteRight = numPagingPage+limitPage;
            $('.pagination li.page-nav[data-page = '+numPageDeleteLeft+']').removeClass('visible');
            $('.pagination li.page-nav[data-page = '+numPageDeleteRight+']').removeClass('visible');
        };
        currentLi.addClass('visible active');
        
        if (_currentpagenum == 'next-limit') {
            $('.pagination li.active').removeClass('visible');
            var visibleIndexRight = $('.pagination li.page-num').filter('.visible:last').data('page') + limitPage;
            if(visibleIndexRight>lastPage) visibleIndexRight = lastPage; 
            var visibleindexLeft = visibleIndexRight - limitPage + 1;
            for (var q = 1; q < lastPage+1; q++) {
                if ((q>visibleIndexRight) || (q<visibleindexLeft)) {
                    $('.pagination li.page-nav[data-page = '+q+']').removeClass('visible');
                }
                else{
                    $('.pagination li.page-nav[data-page = '+q+']').addClass('visible');
                }
                
            };
        };
        if (_currentpagenum == 'prev-limit') {
            $('.pagination li.active').removeClass('visible');
            var visibleindexLeft = $('.pagination li.page-num').filter('.visible:first').data('page') - limitPage;
            if(visibleindexLeft<1) visibleindexLeft = 1; 
            var visibleIndexRight = visibleindexLeft + limitPage - 1;
            for (var j = 1; j < lastPage+1; j++) {
                if ((j>visibleIndexRight) || (j<visibleindexLeft)) {
                    $('.pagination li.page-nav[data-page = '+j+']').removeClass('visible');
                }
                else{
                    $('.pagination li.page-nav[data-page = '+j+']').addClass('visible');
                }
                
            };
        };
        
        if (_currentpagenum == 'first') {
            var ulCenterNav = $('.center-nav-ul');
            ulCenterNav.find('li.page-nav').removeClass('visible');
            var activeLi = ulCenterNav.find('li[data-page=1]').addClass('visible active');
            var nextLi = activeLi.next().addClass('visible');

        };

        if (_currentpagenum == 'last') {
            var ulCenterNav = $('.center-nav-ul');
            ulCenterNav.find('li.page-nav').removeClass('visible');
            var activeLi = ulCenterNav.find('li[data-page='+lastPage+']').addClass('visible active');
            var prevLi = activeLi.prev().addClass('visible');

        };
        
        if (!numPagingPage) numPagingPage = 1;
        var finishRow = numPagingPage*pagingSize;
        var startRow = finishRow - pagingSize;
        if (finishRow>items.length) finishRow = items.length;
        
        var firstVisible = $('.pagination li.page-num').filter('.visible:first').data('page');
        var lastVisible = $('.pagination li.page-num').filter('.visible:last').data('page');
        if (numPagingPage == 1) {
            $('li[data-page = first]').removeClass('visible');
            $('li[data-page = prev]').removeClass('visible');
        }
        else{
            $('li[data-page = first]').addClass('visible');
            $('li[data-page = prev]').addClass('visible');
        }
        if (numPagingPage == lastPage) {
            $('li[data-page = next]').removeClass('visible');
            $('li[data-page = last]').removeClass('visible');
        }
        else{
            $('li[data-page = next]').addClass('visible');
            $('li[data-page = last]').addClass('visible');
        }
        if (firstVisible == 1) {
            $('li[data-page = prev-limit]').removeClass('visible');
        }
        else{
            $('li[data-page = prev-limit]').addClass('visible');
        }
        if (lastVisible == lastPage) {
            $('li[data-page = next-limit]').removeClass('visible');
        }
        else{
            $('li[data-page = next-limit]').addClass('visible');
        }
        $('#'+widget.options.tableid+'-navigation span.label-default').text(numPagingPage+' of '+lastPage);
        widget.options.currentPageInTable = numPagingPage;
        widget.displayTableData(startRow, finishRow);
        widget.makeResponsive();
        // widget._switchlang();

    },

    _sorterString: function(a, b){
        var widget = this;
        var s_znak = 1;
        if ($('table.tablemanager thead tr th span').hasClass('fooicon-sort-desc')) s_znak = -1;
        if ((typeof a.val === 'string') && (typeof b.val === 'string')) {
            a = a.val.toLowerCase();
            b = b.val.toLowerCase();
            if (a === b) return 0;
            if (a < b) return -1*s_znak;
            return 1*s_znak;
        }
                
    },

    sortItems: function(a, b){
        var widget = this;
        return -1*(a.id - b.id);
    },

    _sorterNumber: function(a, b){
        var widget = this;
        var s_znak = 1;
        if ($('table.tablemanager thead tr th span').hasClass('fooicon-sort-desc')) s_znak = -1;
        if ((typeof a.id === 'number') && (typeof b.id === 'number')) {
            a = a.id;
            b = b.id;
            if (a === b) return 0;
            if (a>b) return 1*s_znak;
            return -1*s_znak;
        }
    },

    _sorterPrice: function(a, b){
        var widget = this;
        var s_znak = 1;
        if ($('table.tablemanager thead tr th span').hasClass('fooicon-sort-desc')) s_znak = -1;
        a = +a.val;
        b = +b.val;
        if (a === b) return 0;
        if (a>b) return 1*s_znak;
        return -1*s_znak;
        
    },

    _searchByField:function (){
        var widget = this;
        var columnForSearchMass = [];
        var columnForSearch = $('#dropdown-menu-search li:not(.td-hidden)');
        if (columnForSearch.length != 0) {
            for (var i = 0; i < columnForSearch.length; i++) {
                if (columnForSearch[i].children[0].checked){
                    columnForSearchMass.push(columnForSearch[i].children[0].getAttribute('id').substr(6));
                }
            }
        return columnForSearchMass;
        }else{
            var columnsHead = $('#'+widget.options.tableid+'>thead>tr>th');
            for (var i = 0; i < columnsHead.length; i++) {
                if (columnsHead[i].className.match( /th-filter/i )) {
                    columnForSearchMass.push(columnsHead[i].getAttribute('id'));    
                };
                
            }
        return columnForSearchMass;
        }
          
    },
        
    addNavigationTable: function(){
        var widget = this;
        $('#'+widget.options.tableid+'-navigation').remove();
        
        var kolRow = widget.options.items.length;
        var pagingSize = $('table#'+widget.options.tableid).attr('data-paging-size');
        var limitPage = $('table#'+widget.options.tableid).data('paging-limit');
        var kolPage = Math.ceil(kolRow/pagingSize);
        if (pagingSize) {

            $('<div/>',{id: widget.options.tableid+'-navigation', class: 'footable-paging'}).append(
                $('<div/>',{class:'nav-panel'}).append(
                    $('<div/>',{class:'left-nav-div'}).append(
                        $('<ul/>',{class:'pagination left-nav-ul'}).append(
                            $('<li/>',{class:'page-nav'}).attr('data-page','first').append(
                                $('<a/>',{class:'page-link'}).attr('href','#').text('«')
                            ),
                            $('<li/>',{class:'page-nav mobile-page-nav always-visible'}).attr('data-page','prev').append(
                                $('<a/>',{class:'footable-page-link'}).attr('href','#').text('‹')
                            )
                        )
                    ),
                    $('<div/>',{class:'center-nav-div'}).append(
                        $('<ul/>',{class:'pagination center-nav-ul'})
                    ),
                    $('<div/>',{class:'right-nav-div'}).append(
                        $('<ul/>',{class:'pagination right-nav-ul'}).append(
                            $('<li/>',{class:'page-nav mobile-page-nav always-visible'}).attr('data-page','next').append(
                                $('<a/>',{class:'footable-page-link'}).attr('href','#').text('›')
                            ),
                            $('<li/>',{class:'page-nav'}).attr('data-page','last').append(
                                $('<a/>',{class:'footable-page-link'}).attr('href','#').text('»')
                            )
                        )
                    )
                )
            
            ).insertAfter('div.table-respons');
               
            $('<span/>',{class:'label label-default'}).text('1 of '+kolPage).insertAfter('#'+widget.options.tableid+'-navigation .nav-panel');
            if ($('#select-paging-size').length == 0) {
                $pagingSizeArr = widget.options.pagingSizeArr;
                
            };
            var startPage = $('#'+widget.options.tableid+'-navigation li[data-page=prev]');
            if (kolPage>1) {
                startPage = $('<li/>',{class:'page-nav '}).attr('data-page','prev-limit').append(
                    $('<a/>',{class:'footable-page-link'}).attr('href','#').text('...')
                ).insertAfter(startPage);
                $('ul.right-nav-ul').prepend(
                    $('<li/>',{class:'page-nav'}).attr('data-page','next-limit').append(
                        $('<a/>',{class:'footable-page-link'}).attr('href','#').text('...')
                    )
                )
            };
            
            for (var i = 1; i < kolPage+1; i++) {
                //1-я страница активна
                var centerNavUl = $('ul.center-nav-ul');
                if (i == 1) {
                    centerNavUl.append(
                        $('<li/>',{class:'page-nav page-num visible active'}).attr('data-page',i).append(
                            $('<a/>',{class:'footable-page-link'}).attr('href','#').text(i)
                        )
                    )
                }
                //количество видимых страиц навигации
                else if (i > limitPage){ 
                    centerNavUl.append(
                        $('<li/>',{class:'page-nav page-num'}).attr('data-page',i).append(
                            $('<a/>',{class:'footable-page-link'}).attr('href','#').text(i)
                        )
                    )
                }
                //остальные невидимы
                else{
                    centerNavUl.append(
                        $('<li/>',{class:'page-nav page-num visible'}).attr('data-page',i).append(
                            $('<a/>',{class:'footable-page-link'}).attr('href','#').text(i)
                        )
                    )
                }
                
            }
        }
        return;

    },
    
    calculateUpdated: function(_data) {
        var widget = this;
        var create = new Date(_data).getTime();
        var now = new Date().getTime();
        var old = (now - create)/(24*3600*1000);
        if(old<0) old = 0;
        if (old>1) return old=Math.floor(old)+' '+widget.options.dict.days+' '+widget.options.dict.ago;
        old=old*24;
        if (old>1) return old=Math.floor(old)+' '+widget.options.dict.hours+' '+widget.options.dict.ago;
        return old = Math.floor(old*60) + ' '+widget.options.dict.minute+' '+widget.options.dict.ago;
    },

    createItem: function(_newitemobj, _createitemhandler){
        var widget = this;
        $('.error-form').text('');
        var form = $('#'+widget.options.tableid+'form');
        var data = {};
        var requiredFields = {};
        var address = '';
        for(var key in _newitemobj){
        	requiredFields[key] = {};
        	address = _newitemobj[key].address;
        	if (_newitemobj[key].tinymce) {
        		data[key] = tinyMCE.get(address).getContent();
        	}else{
        		data[key] = form.find(address).val();
        	};
        	(_newitemobj[key].required)? requiredFields[key].required = 'required': requiredFields[key].required = 'notrequired';
        	requiredFields[key].erraddress = address;
        };
        
        sendRequest({
            action: _createitemhandler,
            data: {requiredfields:requiredFields, data:data, tablename:widget.options.tableName},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    var errors = JSON.parse(response.message);
                    $('<div/>', {class: 'errormessage'}).appendTo(widget.options.manager);
                    
                    for(var err in errors) {
                        var errinput = $(err);
                    
                        errinput.next().text(errors[err]).show();
                        errinput.closest('div.form-group').addClass('has-error');
                        $('#'+widget.options.tablename+'form').find('.has-error:first input').focus();
                    }
                   
                }
                else{
                    var itemId = response.data.id;
                    var returnData = {};
                    returnData[itemId] = data;
                    returnData.id = itemId;
                    widget.actionAfterCreateItem(itemId);
                    var checkedFb = widget.checkFbChecked();
                    if (checkedFb) {
                        widget.options.idPostedFb = itemId;
                        widget.fbGetLoginStatus(function(){widget.postToFb(returnData)}, function(){widget.notLoginFb()});
                    }
                }
            }
        });
        
    },

    updateItem: function(self, _handler, _data){
        var widget = this;
        var data = {};
        var actionHandler = _handler;
        $('.error-form').text('');
        if (!actionHandler) actionHandler = 'basic.updateanyitems';
        if (!self) {
            
            var fieldsForChange = widget.options.fieldsForChange;

            var form = $('#'+widget.options.tableid+'form');
            var itemId = form.attr('data-id');
            
            var dataObj = {};
            var requiredFields = {};
            var address = '';
            $valObj = dataObj[itemId] = {};
            for(var key in fieldsForChange){
                requiredFields[key] = {};
                address = fieldsForChange[key].address;
                if (fieldsForChange[key].tinymce) {
                    $valObj[key] = tinyMCE.get(address).getContent();
                }else{
                    $valObj[key] = form.find(address).val();
                };
                (fieldsForChange[key].required)? requiredFields[key].required = 'required': requiredFields[key].required = 'notrequired';
                requiredFields[key].erraddress = address;
            };
            data.data = dataObj;

            data.tablename = widget.options.tableName;
        }else{
            data = _data;
        }
        
        sendRequest({
            action: actionHandler,
            data: data,
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    var errors = JSON.parse(response.message);
                    widget.displayInvalidForm(errors, '#'+widget.options.tableName+'form');
                    
                }
                else{
                   widget.actionAfterUpdateItem();
                }
            }
        });
        return data;
    },
    
    actionAfterUpdateItem:function(){
        var widget = this;
        $('.modal-backdrop').remove();
        $('div.edititemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
        $('div.card-heading').show();
        
        widget.refreshTable($(this).serializeObject(), widget.options.refreshTableHandler);
        widget.clearForm();
    },

    actionAfterCreateItem:function(){
        var widget = this;
        $('.modal-backdrop').remove();
        widget.element.find('div.additemsform').removeClass('itemsform-visible').addClass('itemsform-hidden');
        $('div.card-heading').show();
        widget.refreshTable($(this).serializeObject(), widget.options.refreshtablehandler);
        widget.clearForm();
    },

    _switchLang:function(){
        var widget = this;
        var lang = widget.options.contentLang;
        if(!lang) lang = widget.options.lang;
        
        $('.switchlang').addClass('td-hidden');
        $('.switchlang[data-lang='+lang+']').removeClass('td-hidden td-visible');
        
    },
    
    _createModalGalleryContent: function(){
        var widget = this;
        $('#gallery-dialog').empty().append(
            $('<div/>',{id:'gallery-content'}).append(
                $('<div/>',{class:'al-left'}).append(
                    $('<h1/>').text('Gallery')
                ),
                $('<div/>',{class:'al-clear'}),
                $('<div/>',{class:'tinygallery-container-'+widget.options.tinyGalleryId}).append(
                    $('<form/>',{method:'post', action:'#',id:'images_form'}).append(
                        $('<input/>',{type:'hidden', name:'images_order', id:'images_order', value:''}),
                        $('<ul/>',{id:'tinygallery_images_list'}),
                        $('<div/>',{class:'al-clear'})
                    )
                )
            )
        );
        
        widget.initImagesManager();
    },
    
    drawDataModalGallery:function(_galleryimages){
        var widget = this;
        var galleryImages = _galleryimages;
        var modalGallery = $('ul#tinygallery_images_list').empty();
        for (var i = 0; i < galleryImages.length; i++) {
            modalGallery.append(
                $('<li/>',{id:'image_'+galleryImages[i].id}).append(
                    $('<div/>',{class:'btn-group btn-group-xs action-bar-image'}).append(
                        $('<button/>',{type:'button', class:'btn btn-default delete-item', title:'delete', alt:'delete'}).attr('images_id', galleryImages[i].id).append(
                            $('<span/>',{class:'glyphicon glyphicon-trash'})
                        )
                    ),
                    $('<a/>',{href:'/uploads/tinymce/original/'+galleryImages[i].filename, class:'tinymce-gallery-link'}).append(
                        $('<img/>',{src:'/uploads/tinymce/thumbs/'+galleryImages[i].filename, class:'tinygallery-thumbnail'}).attr('images_id', galleryImages[i].id)
                    )
                )
            )
            
        }
    },

    tinymceInit:function(){
        var widget = this;
        // widget.removetinymce(widget.options.tinymceid);
        widget.options.manager = widget.element.find('.card-heading');
        if ($('div#gallery-dialog').length == 0) {
            widget.options.manager.append(
                $('<div/>',{id:'gallery-dialog', title:'Gallery'})
            ); 
        };
        if (widget.options.tinymceId) {
           for (var i = 0; i < widget.options.tinymceId.length; i++) {
                var tinymceId =  widget.options.tinymceId[i];
                if (!tinyMCE.get(tinymceId)) {
                    tinymce.init({
                        script_url : 'http://'+window.location.host+'/js/tinymce/tinymce.min.js',
                        selector:'#'+tinymceId,
                        // target: textde,
                        content_css : "<?php echo $this->baseUrl('/css/'.$this->theme.'/main.css'); ?>, <?php echo $this->baseUrl('/css/default/body.css'); ?>, <?php echo $this->baseUrl('/plugins/bootstrap-v2.1/css/bootstrap.min.css'); ?>",
                        body_class: "html",
                        importcss_file_filter: "<?php echo $this->baseUrl('/css/'.$this->theme.'/main.css'); ?>",
                        // theme : "modern",
                        menubar: "format",
                        plugins: [
                            "hr textcolor colorpicker link contextmenu image advlist wordcount fullscreen importcss code",
                        ],
                        toolbar: "bold italic underline strikethrough hr | alignleft aligncenter alignright alignjustify | outdent indent | gallery | forecolor backcolor | formatselect | fontselect | fontsizeselect | undo redo | link image | sbullist numlist | fullscreen | code",
                        convert_urls:true,
                        relative_urls:false,
                        remove_script_host:false,
                        importcss_append: true,
                        image_advtab: true,
                        language : widget.options.lang,
                        setup : function(ed) {
                            ed.addButton('gallery', {
                                title : 'Gallery',
                                image : 'http://'+window.location.host+'/img/admin/gallery.png',
                                onclick : function() {
                                    // ed.windowManager.alert(location.href);

                                    var currentEditor = ed;
                                    $( "#dialog:ui-dialog" ).dialog( "destroy" );

                                    $( "#gallery-dialog" ).dialog({
                                        height: 600,
                                        width: '70%',
                                        modal: true,
                                        open: function(event, ui) {
                                            // $('#gallery-content').load('http://standard.karle-cms.local/application/modules/admin/controllers/ImagesController.php');
                                            widget._createModalGalleryContent();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            } 
        }
        
                
    },

    changeLang: function(_target){
        var widget = this;
        var currentLang = $('.switch-lang button.active').attr('data-language');
        $('.switch-lang button.active').removeClass('active');
        _target.addClass('active');
        
        widget.options.contentLang = _target.attr('data-language');
        widget._switchLang();
    },

    selectLanguage: function(){
        var widget = this;
        var lang = widget.options.contentLang;
        if (!lang) lang = widget.options.contentLang = widget.options.lang;
        $('div.switch-lang button.active').removeClass('active');
        $('div.switch-lang button[data-language='+lang+']').addClass('active');
    },

    toggleSortIcon:function(el){
        var widget = this;
        if (widget.options.thtoggle !== el.attr('id')) {
            widget.options.toggleCount = 0;
            widget.options.thtoggle = el.attr('id');
            $('.fooicon').removeClass('fooicon-sort-desc').removeClass('fooicon-sort-asc');
        };
        if (widget.options.toggleCount++%2 == 0) {
            el.find('span.fooicon').removeClass('fooicon-sort-desc').addClass('fooicon-sort-asc');
        }
        else{
            el.find('span.fooicon').removeClass('fooicon-sort-asc').addClass('fooicon-sort-desc');   
        };
        widget.sortTable(el);
    },

    toggleExpandIcon:function(el, target){
        var widget = this;
        if (target.nodeName != 'BUTTON') {
            if (el.find('span.fooicon-details').hasClass('fooicon-plus')) {
                el.find('span.fooicon-details').removeClass('fooicon-plus').addClass('fooicon-minus');
            }
            else if (el.find('span.fooicon-details').hasClass('fooicon-minus')){
                el.find('span.fooicon-details').removeClass('fooicon-minus').addClass('fooicon-plus');
                el.next().remove();
            }
            widget.showDetailRows();
        }
    },

    displayInvalidForm:function (_errorsarray, _formid){
        var widget = this;
        var form = $(_formid);
        for(var err in _errorsarray) {
            var errInput = form.find('.form-control[id=input-'+err+']');
            errInput.closest('div.form-group').addClass('has-error');
            var errInputId = errInput.attr('id');
            var errInputLabelTxt = form.find('label.control-label[for='+errInputId+']').text();
            if (errInput.attr('data-id') == 'email') {
                errInput.next().text(widget.options.dict.input+' valid '+errInputLabelTxt).show();
            }else{
                errInput.next().text(widget.options.dict.input+' '+errInputLabelTxt).show();
            }
                            
        }
        form.find('.has-error:first input').focus(); 
    },

    formatMoney:function(data, _divider){
        var widget = this;
        var formatData = '';
        var count = 0;
        var divider = '.';
        if (_divider) divider = _divider;
        for (var i = data.length-1; i >=0 ; i--) {
            formatData= data[i] + formatData;
            count++;
            if ((count%3 == 0) && (count != data.length))  formatData = divider + formatData;
        }
        return formatData;
    },
    
    initImagesManager:function(){
        var widget = this;
        $thumbEditContainer = "<div class='thumb-box'>\
                                <div class='btn-group btn-group-xs action-bar-image'>\
                                    <button type='button' class='btn btn-default delete-item' title='delete' alt='delete'>\
                                        <span class='glyphicon glyphicon-trash'>\
                                    </button>\
                                </div>\
                                <div class='gallery-thumbnail-contailer'></div>\
                            </div>";
        var gallery = $('.tinygallery-container-'+widget.options.tinyGalleryId);
        gallery.imagesmanager({
            dict: widget.options.dict, 
            uploadImgDirObj:widget.options.uploadImgDirObj,
            galleryid:'tinygallery',
            mainImgDir:'tinymce',
            thumbContainer:$thumbEditContainer,
            refreshContentAction:'basic.getgalleryimages',
            refreshContentData:null,
            addimgtobdAction:'basic.addpagesgalleryimgtobd',
            addimgtobdData:{file: ''},
            deleteImgAction:'basic.deletegalleryimages',
            deleteImgData: {itemid: '', tablename: 'images'},
            saveGalleryItemsAction:'basic.updategalleryitems',
            saveGalleryItemsData:{data:{}, tablename: 'gallery'},
            sortable:false
        });

    },

    calcHeightGalleryLi:function(_el){
        var widget = this;
        var currentHeight = _el[0].classList[0];
        var maxHeight = widget.options[currentHeight];
        if (!maxHeight) maxHeight = 0;
        for (var i = 0; i < _el.length; i++) {
            if (_el[i].offsetHeight > maxHeight) {
                maxHeight = _el[i].offsetHeight;
            };
            
        };
        
        widget.options[currentHeight] = maxHeight;
        _el.height(maxHeight);
    },

    toggleTabContent:function(_elid){
        var widget = this;
        var manager = $('div#'+widget.options.managerId+ '-manager');
        var navtab = manager.find('.switch-edit-content');
        var activebutton = navtab.find('button.active');
        if (activebutton.attr('data-href') !== _elid) {
            activebutton.removeClass('active');
            navtab.find('button[data-href='+_elid+']').addClass('active');
            var tab = manager.find('.tab-pane');
            tab.hide();
            var showTab = tab.closest('.tab-content').children('div'+_elid);
            tab.closest('.tab-content').children('div'+_elid).show();
            widget.setActiveTab(_elid);
        };
        
    },

    setActiveTab:function(_id){
        var widget = this;
        $('div.tab-content').children('div.active').removeClass('active');
        $('div'+_id).addClass('active');
    },

    removeTinymce:function(_tinymceidArr){
        var widget = this;
        for (var i = 0; i < _tinymceidArr.length; i++) {
            var tinyid = _tinymceidArr[i];
            if (tinyMCE.get(tinyid)) {
                tinyMCE.get(_tinymceidArr[i]).remove();
            };

        };
        
    },

    initFB:function(){
        var widget = this;
        $.ajaxSetup({ cache: true });
        $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
            FB.init({
              appId: '156073661609400', // Denis Kucher id apps
              // appId: '385707731483792', // id for Bernhard Karle apps;
              version: 'v2.10', // or v2.1, v2.2, v2.3, ...
              status  : true,
              cookie  : true, 
              oauth: true,
              xfbml   : true
            });     
        });
    },

    setCheckSendToFb:function(){
        var widget = this;
        $input = $('#inputsendtofb');
        
        if (widget.options.fbsettings.sendToFbDefault == 'yes'){
            $input.attr('checked','checked');  
        }else{
            $input.removeAttr('checked');
        }
    },

    getFBSettings:function(_callBackFn){
        var widget = this;
        sendRequest({
            action: 'basic.getfbsettings',
            data: '',
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.options.fbsettings = response.data.fb;
                    // widget.drawWidgetContent();// ЗАМЕНИЛ НА CALLBACK FUNCTION 
                    // console.log(widget.options.fbsettings);
                    _callBackFn();
                    // _callBackFn.apply();
                }
            }
            
        });
    },

    fbGetLoginStatus:function(_callBackFn, _callBackFn2){
        var widget = this;
        FB.getLoginStatus(function(response) {
            // console.log( response );
            if ((response.status)&&(response.status=='connected')) {
                widget.options.fbAccesToken = response.authResponse.accessToken;
                _callBackFn()
            } else {
                $('#send_to_fb_err').empty();
                $('#send_to_fb_err').css({'display':'block','margin-top':'10px'}).append(
                    $('<span/>').text(widget.options.dict.notloggedtoFb+': ').append(
                        $('<a/>',{href:'#', id:'login_fb'}).text('[Login]')
                    )
                );
                _callBackFn2()
            }   
        }, {scope: 'user_posts', return_scopes: true});
    },

    notLoginFb:function(){
        var widget = this;
        return;
    },

    myFacebookLogin:function(_callBackFn, _callBackFn2) {
        var widget = this;
        FB.login(function(response){
            if (response.status === 'connected') {
                $('#send_to_fb_err').css('display','none').find('span').text('');
                widget.options.fbAccesToken = response.authResponse.accessToken;
                // widget.dataPostToFacebook(_fbData);
                // widget.fbGetLoginStatus(_callBackFn, _callBackFn2);
                _callBackFn();
            }else {
                alert('Eror. Not Logged! Try again.')
            }
        }, {scope: 'publish_actions, user_posts'});
    },

    myFacebookLogout:function(){
        var widget =this;
        FB.logout(function(response) {
           console.log( response );
        }, true);
        return true;
    },

    checkFbChecked:function(){
        var widget = this;
        if ($('#inputsendtofb').is(':checked')){
            widget.options.sendtoFbFlag = true;
            // widget.collcetImageTitleBeforeSave(); // replace to event handler;
            return true;
        }
        return false;
    },
    
    checkExistPhotoPost:function(_obj, _num, _dataObj, _callBackFn){
        var widget = this;
        var imagesObj = _obj;
        var fbPostId = imagesObj.fb_post_id
        if (fbPostId) {
            FB.api('/'+fbPostId, 'GET',
                function (response) {
                    widget.options.countCheckExistPost++;
                    if (response && response.error){
                        if (_num) {
                            _dataObj.push(imagesObj);
                            if (widget.options.countCheckExistPost == _num){
                                widget.preparePostToFacebook(_dataObj);
                                widget.setCheckSendToFb();
                            }
                        }else{
                           _callBackFn();
                        }
                    }
                }
            );
        }else{
            if (_num) {
                _dataObj.push(imagesObj);
                widget.options.countCheckExistPost++;
                if (widget.options.countCheckExistPost == _num){
                    widget.preparePostToFacebook(_dataObj);
                    widget.setCheckSendToFb();
                }
            }else{
                _callBackFn();
            }
        }
    },

    preparePostToFacebook:function(_postObj){
        var widget = this;
        widget.options.countPostToFacebook = 0;
        
        for (var i = 0; i < _postObj.length; i++) {
            var item = _postObj[i];
            widget.beforePostToFacebook(item, _postObj.length);
        };
    },

    postPhotoToFacebook:function(_data, _imagesNum){
        var widget = this;
        widget.options.fbPostData = _data;
        FB.api('/me/photos', 'post', _data,
            function (response) {
                widget.options.countPostToFacebook++;
                if (response && !response.error) {
                    widget.options.fbAttachedMedia.push({'media_fbid':response.id});
                    if (_imagesNum == widget.options.countPostToFacebook) {
                        var publishData = {};
                        publishData.attached_media = widget.options.fbAttachedMedia;
                        if (_imagesNum == 1) publishData.message = widget.options.fbPostData.caption;
                        widget.publishToFacebook(publishData);
                        widget.clearObj(widget.options.fbPostData);
                    };
                }
            }
        );
        
    },

    publishToFacebook:function(_data, _message, _fbid, _itemid){
        var widget = this;
        var point = '';
        if (_fbid) {
            point = '/'+_fbid;
        }else{
            point = '/me/feed';
        };

        if (_message) _data.message = _message;
        _data.access_token = widget.options.fbAccesToken;
        FB.api(point, 'post', _data,
            function (response) {
                if (response && !response.error) {
                    var fbPostId = response.id;
                    if (!_fbid) widget.setFbPostId(fbPostId, _itemid);
                    widget.options.sendtoFbFlag = false;
                    widget.setCheckSendToFb();
                }
            }
        );
    },

    checkExistPostFb:function(fbPostId){
        var widget = this;
        FB.api('/'+fbPostId, 'get', 
            function (response) {
                if (response && !response.error) {
                    widget.updateFbPost(fbPostId);
                }else{
                    widget.postToFb();
                }
            }
        );
    },

    getFbPostId:function(_table, _id, _field, _callBackFn){
        var widget = this;
        sendRequest({
            action: 'basic.getfbpostid',
            data: {table: _table, id: _id, field: _field},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.options.fbPostId = response.data.fbpostid;
                    _callBackFn();
                }
            }
            
        });

    },

    clearObj:function(_obj){
        var widget = this;
        for (var i in _obj) {
            delete _obj[i];
        };
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
