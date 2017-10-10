<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetNewsItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $newsid = $this->_getString('newsid', $_params, false);
            
            $newsitem = $mySql->getRecords('news', array('id'=>$newsid), '`id`');
            $newsimg = $mySql->getRecords('news_images', array('ni_news_id'=>$newsid), '`ni_id`');
            
            $this->data['newsitem'] = $newsitem;
            $this->data['newsimg'] = $newsimg;
            
        }
    }
        

?>