<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_ActiveItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $data = $this->_getString('data', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            $itemid = $this->_getString('itemid', $_params, false);

            $mySql->update($tablename, array('status' => $data), array('id' => $itemid));
            
        }
    }
        

?>