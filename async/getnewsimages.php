<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    
    class Basic_GetNewsImages_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $newsid = $this->_getString('newsid', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            
            $newsImg = $mySql->getRecords($tablename, array('ni_news_id'=>$newsid), '`ni_id`');
            
            $this->data['images'] = $newsImg;
            
        }
    }
        

?>