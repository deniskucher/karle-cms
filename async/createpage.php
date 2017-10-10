<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_CreatePage_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $flag = false;
            
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

            $json = json_encode($errormessagearray);

            if ($flag) {throw new AsyncActionException($json);}
            else{
                
                $data['domain_id'] = $_domainId;
                $pageinsert = $mySql->insert($tablename, $data);
                $lastpageId = mysql_insert_id();
            }
            
            if ($pageinsert) {
                $maxorder = $mySql->max('order_num', 'menu', array('domain_id' => $_domainId));
                $data['domain_id'] = $_domainId;
                $orderNum = $maxorder+1;
                $mySql->insert('menu', array('domain_id'=>$_domainId, 'order_num'=>$orderNum,'title_de'=>$data['title_de'],'title_en'=>$data['title_en'],'type'=>'page','page_id'=>$lastpageId,'visible'=>'y'));
            }
            
            $this->data['data'] = $data;
            $this->data['fields'] = $fields;
            
        }
    }
        

?>