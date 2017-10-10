<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            // $newsimg = array();
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $itemid = $this->_getString('itemid', $_params, true);
            $tablename = $this->_getString('tablename', $_params, true);
            					
            $mySql->delete($tablename, array('id'=>$itemid));

            // $mySql->delete('news_images', array('ni_news_id'=>$itemid));

            // foreach ($newsimg as $key => $value) {
            //     $newsimgsrc  = 'uploads/news/photos/'.$newsimg[$key]['ni_image'];
            //     $newsthumbsrc  = 'uploads/news/thumbs/'.$newsimg[$key]['ni_image'];
            //     @unlink($newsimgsrc);
            //     @unlink($newsthumbsrc);
            // }
            
        }
    }
        

?>