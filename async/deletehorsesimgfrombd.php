<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteHorsesImgFromBD_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            // $newsimg = array();
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $itemid = $this->_getString('itemid', $_params, true);
            $tablename = $this->_getString('tablename', $_params, true);
            $horsesid = $this->_getString('horsesid', $_params, true);

            $mainimgid = $mySql->getRecord('horses', array('id' => $horsesid),'`id`');
            $mySql->delete($tablename, array('id'=>$itemid));
            if ($mainimgid['main_image'] == $itemid) {
                $mainimgidnew = $mySql->getRecords('horse_photos', array('horse_id'=>$horsesid),'`order_num`');
                $mySql->update('horses', array('main_image' => $mainimgidnew[0]['id']), array('id' => $horsesid));
            }
            
        }
    }
        

?>