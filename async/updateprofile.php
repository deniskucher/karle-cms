<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateProfile_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $flag = false;

            $profiledata = $this->_getArray('profiledata', $_params, false);
            $fields = $this->_getArray('profilerequiredfields', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            

            $errormessagearray = array();
            foreach ($fields as $key => $value) {
                if ($value['required'] == 'required') {
                    if (($profiledata[$key] == '') or ($profiledata[$key] == null) or ($profiledata[$key] == '*')) {
                        $erraddress = $fields[$key]['erraddress'];
                        $errormessagearray[$erraddress] = "Input ".$key."!";
                        $flag = true;  
                        
                    }
                };
                
            }

            foreach ($profiledata as $key1 => $value1) {
                if ($key1 == 'password') {
                    $profiledata[$key1] = md5(SALT . md5($value1));
                }
                if (($key1 == 'email') and (!filter_var($value1, FILTER_VALIDATE_EMAIL))) {
                    $errormessagearray['email'] = "Input valid email!";
                    $flag = true;
                }
            }
            
            $profiledata['hash_code'] = md5($profiledata['username'] . uniqid()); 

            $this->data['profiledata'] = $profiledata;
            $json = json_encode($errormessagearray);

            if ($flag) {throw new AsyncActionException($json);}
            else{
                
                $mySql->update($tablename, $profiledata, array('domain_id' => $_domainId));
                
            }
           
        }
    }
        

?>