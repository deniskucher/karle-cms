<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetGallery_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $galleryitems = $mySql->getRecords('gallery', array('domain_id' => $_domainId),'`order_num`');
            
            if (!$galleryitems) {
                
                throw new AsyncActionException('Data not found.');

            }
            
            
            $this->data['tabledata'] = $galleryitems;
            $this->data['images'] = $galleryitems;
        }
    }
        

?>