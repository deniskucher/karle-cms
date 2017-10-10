<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetItem_AsyncAction extends Basic_Abstract_AsyncAction
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
            
            if (!$item) throw new AsyncActionException('Data not found.');

            // $itemsimg = $mySql->getRecords($tablename.'_images', array('ni_news_id'=>$itemid), '`ni_id`');
            
            $this->data['item'] = $item;
            // $this->data['itemsimg'] = $itemsimg;
            
        }
    }
        

?>