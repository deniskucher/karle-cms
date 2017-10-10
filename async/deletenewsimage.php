<?php
 
     
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteNewsImage_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $image = $this->_getString('imgsrc', $_params, false);
            $thumb = $this->_getString('thumb', $_params, false);
            $imgid = $this->_getString('imgid', $_params, false);
            
            $mySql->delete('news_images', array('ni_id'=>$imgid)); 

            @unlink($image);
            @unlink($thumb);
            
        }
    }

?>