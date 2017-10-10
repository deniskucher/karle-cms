<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetFbPostId_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $id = $this->_getString('id', $_params, true);
            $table = $this->_getString('table', $_params, true);
            $field = $this->_getString('field', $_params, true);
            
            $fbPostId = $mySql->getRecord($table, array('id'=>$id));
            $fbPostId = $fbPostId[$field];

            $this->data['fbpostid'] = $fbPostId;
        }
    }
        

?>