/**
* profile Manager
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.03.17
*/
$.widget('nm.profilemanager', $.dk.entitymanager, {

    options: {
        dummy: 'dummy',
        tableName:'users',
        tableId:'profile',
        refreshTableHandler:'basic.getprofile'
    },
    
    _create: function () {
        var widget = this;
        
        this.element.on('click','div#profileform .senddataonserver', function() {
            $('#profileform').find('.has-error').removeClass('has-error');
            widget.updateProfile();
        });

        this.element.on('focus', 'div#profileform .modal-body input[type=text], div#addoptionform .modal-body input[type=text]', function() {
            $(this).next().hide();
        });
        
        this.element.on('blur', 'div#profileform .modal-body input[type=text], div#addoptionform .modal-body input[type=text]', function() {
            if ($(this).val()=='') $(this).next().show();
        });
        
        this.refreshTable();
    },
	
	refreshTable: function () {
        var widget = this;
        
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
                    widget.options.profileObj = data.profileobj[0];
                    widget.createProfileForm();
                }
            }
        });
    },
    
    createProfileForm:function(){
        var widget = this;
       
        var profileObj = widget.options.profileObj;
        // $('#'+widget.options.tableid+'form').remove();
        if ($('#'+widget.options.tableId+'form').length == 0) {
            $('div.card').append(
                $('<div/>', {class:'additemsform', id:widget.options.tableId+'form'}).append(
                    $('<div/>',{class:'itemsform-dialog'}).append(
                        $('<div/>',{class:'itemsform-content'}).append(
                            $('<div/>',{class:'modal-header'}).append(
                                $('<h4/>', {class:'modal-title'}).text(widget.options.dict.myAccountSettings),
                                $('<h4/>', {class:'modal-title'}).text(profileObj.username)
                            ),
                            $('<div/>',{class:'modal-body'}).append()
                        ),
                        $('<div/>', {class:'modal-footer col-sm-11 col-lg-10'}).append(
                            $('<button/>', {class: 'btn btn-primary senddataonserver', type:'submit'}).text(widget.options.dict.updateprofile)
                        )
                    )
                )
            );
        };
        var modalBody = $('#'+widget.options.tableId+'form .modal-body');
        modalBody.find('form.form-horizontal').remove();
        $('<form/>', {class:'form-horizontal', role:'form'}).append(
            $('<div/>',{class:'form-group responsive-label required'}).append(
                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-first_name').text(widget.options.dict.firstname),
                $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                    $('<input/>',{class:'form-control profiledata', type:'text', id:'input-first_name'})
                    .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.firstname).val(profileObj.first_name),
                    $('<span/>',{class:'error-form'})
                )
            ),
            $('<div/>',{class:'form-group responsive-label required'}).append(
                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-last_name').text(widget.options.dict.lastname),
                $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                    $('<input/>',{class:'form-control profiledata', type:'text', id:'input-last_name'})
                    .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.lastname).val(profileObj.last_name),
                    $('<span/>',{class:'error-form'})
                )
            ),
            $('<div/>',{class:'form-group responsive-label required'}).append(
                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-email').text('E-mail'),
                $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                    $('<input/>',{class:'form-control profiledata', type:'text', id:'input-email', 'data-id':'email'})
                    .attr('placeholder', widget.options.dict.input+' e-mail').val(profileObj.email),
                    $('<span/>',{class:'error-form'})
                )
            ),
            $('<div/>',{class:'form-group responsive-label'}).append(
                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-password').text(widget.options.dict.password),
                $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                    $('<input/>',{class:'form-control', type:'password', id:'input-password'})
                    .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.password),
                    $('<span/>',{class:'error-form'})
                )
            ),
            $('<div/>',{class:'form-group responsive-label'}).append(
                $('<label/>',{class:'col-sm-3 control-label'}).attr('for','input-retypepassword').text(widget.options.dict.retypepassword),
                $('<div/>',{class:'col-sm-8 col-lg-7'}).append(
                    $('<input/>',{class:'form-control', type:'password', id:'input-retypepassword'})
                    .attr('placeholder', widget.options.dict.input+' '+widget.options.dict.retypepassword),
                    $('<span/>',{class:'error-form'})
                )
            )
        ).prependTo(modalBody);

        widget.successSaveMessage();
    },
   
    updateProfile: function(){
        var widget = this;
        $('.error-form').text('');

        var profileData = {};
        var profileRequiredFields = {};
        var form = $('#'+widget.options.tableId+'form');
        var profileObj = form.find('.profiledata');
        var pass = form.find('#input-password');
        var repass = form.find('#input-retypepassword');
        pass.next().text('');
        repass.next().text('');
        var passln = pass.val().length;
        if ((pass.val().length < 6) &&(pass.val().length>0)) {
            pass.next().text(widget.options.dict.errmesspassw);
            return;
        }else if (repass.val()!== pass.val()) {
                repass.next().text(widget.options.dict.errmessrepassw);
                return;
        }else{
            if(pass.val().length>0) profiledata.password = pass.val();
        }
        
        for (var i = 0; i < profileObj.length; i++) {
            var columnName = profileObj[i].getAttribute('id').substring(6);
            var value = profileObj[i].value;
            profileData[columnName] = value;
            profileRequiredFields[columnName] = {};
            var hasAttrRequired = profileObj[i].closest('div.form-group').classList.contains('required');
            (hasAttrRequired)? profileRequiredFields[columnName].required = 'required': profileRequiredFields[columnName].required = 'notrequired';
            profileRequiredFields[columnName].erraddress = columnName;
        };
        
        sendRequest({
            action: 'basic.updateprofile',
            data: {profilerequiredfields:profileRequiredFields, profiledata:profileData, tablename:widget.options.tableName},
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    var errors = JSON.parse(response.message);
                    widget.displayInvalidForm(errors, '#profileform');
                    // widget.scroll_To('#profileform');
                    
                }
                else{
                    var data = response.data.profiledata;
                    widget.refreshTable();
                    $successSaveMessage = $('div#profileform #successsave');
                    $successSaveMessage.show('slow');
                    setTimeout(function() {
                        $successSaveMessage.hide('slow');
                    },3000);
                    widget.clearPasswordInForm();
                }
            }
        });
    },

    clearPasswordInForm:function(){
        var widget = this;
        $('#'+widget.options.tableId+'form').find('input[type=password]').val('');
    },

    successSaveMessage: function(){   
        var widget = this;
        if($('div#profileform #successsave').length == 0){   
            $('#profileform .modal-body').append(
                $('<div/>',{class:'row', id:'successsave'}).append(
                    $('<div/>',{class:'col-xs-12 at-nl'}).append(
                        $('<div/>',{class:'at-warning-box'}).text(widget.options.dict.profilesaved)
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
