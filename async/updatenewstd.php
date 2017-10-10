<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateNewsTd_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            
            // Extract inputs
            $id = $this->_getPositiveInteger('id', $_params, false);
            $action = $this->_getString('action', $_params, false);
            $value = $this->_getString('value', $_params, false);
            
            $existuser = $mySql->getRecords('news', array('id' => $id));
            if (!$existuser) {
                throw new AsyncActionException('ЗАПИСЬ НЕ НАЙДЕНА!');
            }
            
            $mySql->update('news', array($action => $value), array('id' => $id));
            
            
            
        }
        
    }

?>