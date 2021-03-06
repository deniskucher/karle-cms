<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_CreateCustomSettings_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $flag = false;
            $flagkey = false;
            $data = $this->_getArray('data', $_params, false);
            $fields = $this->_getArray('requiredfields', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);

            $errormessagearray = array();
            foreach ($fields as $key => $value) {
                if ($value['required'] == 'required') {
                    if (($data[$key] == '') or ($data[$key] == null) or ($data[$key] == '*')) {
                        $erraddress = $fields[$key]['erraddress'];
                        $errormessagearray[$erraddress] = "Input ".$key."!";
                        $flag = true;  
                    }
                }
            }
            $existkey = $mySql->getRecords('custom_settings', array('key'=>$data['key']));
            if ($existkey) {
                $flagkey = true;
                $errormessagearray['input-key'] = "key_in_use"; 

            }
            $json = json_encode($errormessagearray);

            if ($flag) {throw new AsyncActionException($json);}
            elseif ($flagkey) {
                throw new AsyncActionException($json);
            }
            else{
                
                $data['domain_id'] = $_domainId;
                $mySql->insert($tablename, $data);
            }
            
            $this->data['data'] = $data;
            $this->data['fields'] = $fields;
            
        }
    }
        

?>