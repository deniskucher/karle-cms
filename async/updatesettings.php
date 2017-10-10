<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateSettings_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $flag = false;
            $flag1= false;
            $settingsdata = $this->_getArray('settingsdata', $_params, false);
            $settingsrequiredfields = $this->_getArray('settingsrequiredfields', $_params, false);
            $customsettingsdata = $this->_getArray('customsettingsdata', $_params, false);
            $customsettingsrequiredfields = $this->_getArray('customsettingsrequiredfields', $_params, false);
            

            $errormessagearray = array();
            foreach ($settingsrequiredfields as $keyid => $obj) {
                if ($obj['required'] == 'required') {
                    if (($settingsdata[$keyid] == '') or ($settingsdata[$keyid] == null) or ($settingsdata[$keyid] == '*')) {
                        $erraddress = $settingsrequiredfields[$keyid]['erraddress'];
                        $errormessagearray[$erraddress] = "Input data!";
                        $flag = true;  
                    }
                }
            }
            $errormessagearray1 = array();
            if ($customsettingsrequiredfields) {
                foreach ($customsettingsrequiredfields as $keyid1 => $obj1) {
                    if ($obj1['required'] == 'required') {
                        if (($settingsdata[$keyid1] == '') or ($settingsdata[$keyid1] == null) or ($settingsdata[$keyid1] == '*')) {
                            $erraddress = $settingsrequiredfields[$keyid1]['erraddress'];
                            $errormessagearray1[$erraddress] = "Input data!";
                            $flag1 = true;  
                        }
                    }
                }
            }
            

            $json = json_encode($errormessagearray);
            $json1 = json_encode($errormessagearray1);

            if ($flag) {throw new AsyncActionException($json);}
            else{
                foreach ($settingsdata as $id => $value) {
                    $mySql->update('settings', array('value' => $value), array('domain_id' => $_domainId, 'name' => $id));
                }
            }
            if ($flag1) {throw new AsyncActionException($json1);}
            else{
                foreach ($customsettingsdata as $id1 => $value1) {
                    $mySql->update('custom_settings', $value1, array('id' => $id1));
                }
            }
        }
    }
        

?>