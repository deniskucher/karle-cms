<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_SetMainImage_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $itemid = $this->_getString('itemid', $_params, true);
            
            $imgid = $this->_getString('imgid', $_params, false);
            
            $tablename = $this->_getString('tablename', $_params, true);
            
            if (!$imgid) $imgid = 0;

            $mySql->update($tablename, array('main_image' => $imgid), array('id' => $itemid));
        }
    }
        

?>