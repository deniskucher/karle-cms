<?php
 
     
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteNewsImgFromBd_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            // Extract inputs
            $itemid = $this->_getString('itemid', $_params, true);
            $tablename = $this->_getString('tablename', $_params, true);
            $newsid = $this->_getString('newsid', $_params, true);

            $mySql->delete($tablename, array('ni_id'=>$itemid));
            
        }
    }

?>