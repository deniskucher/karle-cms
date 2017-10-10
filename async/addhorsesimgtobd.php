<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_AddHorsesImgtobd_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {   


            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $file = $this->_getString('file', $_params, false);
            $horseid = $this->_getString('horseid', $_params, true);
            
            $horse = $mySql->getRecord('horses', array('id'=>$horseid));
            $mainimgid = $horse['main_image'];

            $maxorder = $mySql->max('order_num', 'horse_photos', array('horse_id' => $horseid, 'domain_id' => $_domainId));
            if ($maxorder) $existimage = true;
        
            $maxorder++;
            $mySql->insert('horse_photos', array('filename' => $file, 'domain_id' => $_domainId, 'order_num' => $maxorder, 'horse_id' => $horseid));
            $insertId = mysql_insert_id();
            if (!$mainimgid) $mainimgid = mysql_insert_id();

            if (!$existimage) {
                $mySql->update('horses', array('main_image' => $mainimgid), array('id' => $horseid));
                
            }

            $horsephoto = $mySql->getRecord('horse_photos', array('id'=>$insertId));

            $this->data['horsephoto'] = $horsephoto;

        }
    }
        

?>