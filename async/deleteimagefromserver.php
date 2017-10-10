<?php
 
     
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteImageFromServer_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $data = $this->_getString('data', $_params, false);
            $data_arr = json_decode($data, TRUE);
            
            foreach ($data_arr as $value) {
                @unlink($value);    
            }
            
        }
    }

?>