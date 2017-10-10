<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_AddPagesGalleryImgtobd_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $file = $this->_getString('file', $_params, false);
            
            $mySql->insert('images', array('filename' => $file, 'domain_id' => $_domainId));
                
            
        }
    }
        

?>
