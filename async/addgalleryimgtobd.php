<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_AddGalleryImgtobd_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $file = $this->_getString('file', $_params, false);
            
            $maxorder = $mySql->max('order_num', 'gallery', array('domain_id' => $_domainId));
            
            $maxorder++;
            $mySql->insert('gallery', array('filename' => $file, 'domain_id' => $_domainId, 'order_num' => $maxorder));
            
            $this->data['filesarr'] = $files;
            
        }
    }
        

?>