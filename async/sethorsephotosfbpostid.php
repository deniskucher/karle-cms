<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_SetHorsePhotosFbPostId_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $id = $this->_getString('fbPostId', $_params, true);
            $images = $this->_getArray('images', $_params, true);
            
            foreach ($images as $key => $value) {
                $imageId = $value['id'];
                $mySql->update('horse_photos', array('fb_post_id' => $id), array('id' => $imageId));
            }
           
        }
    }
        

?>