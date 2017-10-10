<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetPriceItem_AsyncAction extends Basic_Abstract_AsyncAction
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
            $item = $mySql->getRecords($tablename, array('id'=>$itemid), '`id`');
            
            $this->data['item'] = $item;
            
            
        }
    }
        

?>