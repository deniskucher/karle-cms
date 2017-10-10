<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_SetNewsFbPostId_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $id = $this->_getString('fbPostId', $_params, true);
            $newsid = $this->_getString('newsId', $_params, true);
            
            $mySql->update('news', array('fb_post_id' => $id), array('id' => $newsid));
        }
    }
        

?>