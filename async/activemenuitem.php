<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_ActiveMenuItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $menuorder = $this->_getArray('menuorder', $_params, false);
            if ($menuorder) {
                foreach ($menuorder as $id => $order) {
                    $mySql->update('menu', array('order_num' => $order), array('id' => $id));
                }          
            }            
            
            $flag = false;

            $data = $this->_getArray('data', $_params, false);
            $fields = $this->_getArray('requiredfields', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            $itemid = $this->_getString('itemid', $_params, false);
            
            if ($fields and $data) {
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
            }
            

            $json = json_encode($errormessagearray);

            if ($flag) {throw new AsyncActionException($json);}
            else{
                
                if ($data) {
                    $mySql->update($tablename, $data, array('id' => $itemid));
                }
                
                
            }
            
        }
    }
        

?>