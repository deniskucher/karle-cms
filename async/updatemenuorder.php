<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateMenuOrder_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $menuorder = $this->_getArray('menuorder', $_params, false);
                        
            foreach ($menuorder as $id => $order) {
                $mySql->update('menu', array('order_num' => $order), array('id' => $id));
            }
            
        }
    }
        

?>