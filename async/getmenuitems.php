<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetMenuItems_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $itemid = $this->_getString('itemid', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            $item = $mySql->getRecord($tablename, array('id'=>$itemid));
            
            $this->data['item'] = $item;
        }
    }
        

?>