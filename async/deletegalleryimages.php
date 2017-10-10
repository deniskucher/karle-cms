<?php
 
     
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteGalleryImages_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            // $imageid = $this->_getString('imageid', $_params, false);
            $itemid = $this->_getString('itemid', $_params, true);
            // $imagesrc = $this->_getString('imagesrc', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            
            // $mySql->delete($tablename, array('id'=>$imageid)); 
            $mySql->delete($tablename, array('id'=>$itemid)); 
            // $imagethumb = $imagesrc;
            // $imageoriginal = str_replace('thumbs', 'original', $imagesrc);
            
            // @unlink($imagethumb);
            // @unlink($imageoriginal);
            
        }
    }

?>