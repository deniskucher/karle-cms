<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    
    class Basic_GetHorsesItem_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $itemid = $this->_getString('itemid', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
               
            // $horsesitem = $mySql->mixedselectDistinct('horses.name, horses.main_image,horses.id, prices.price,horses.sex,horses.age,horses.father,horses.status,horses.updated,horse_photos.filename,horses.domain_id, horses.price_id', array('horses', 'prices','horse_photos'), 
            //     '(horses.domain_id='.$_domainId.' and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=prices.id) or 
            //     (horses.domain_id='.$_domainId.' and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1) or
            //     (horses.domain_id='.$_domainId.' and horses.main_image=0 and horse_photos.id=3667 and horses.price_id=prices.id) or 
            //     (horses.domain_id='.$_domainId.' and horses.main_image=0 and horse_photos.id=3667 and horses.price_id=0 and prices.id=1)','id')
            // ->fetchAll();
           
            $horsesitem = $mySql->getRecord($tablename, array('id'=>$itemid), '`id`');
            $facebookEnabled = $mySql->getRecord('users', array('domain_id'=>$_domainId));
            $facebookEnabled = $facebookEnabled['facebook'];
            $sendToFbDefault = $mySql->select('value', 'settings', array('name' => 'send_to_fb_default', 'domain_id'=>$_domainId))->fetchCellValue('value');
            
            if (!$horsesitem) {
                
                throw new AsyncActionException('Data not found.');

            }else{
                $horsesphotos = $mySql->getRecords('horse_photos', array('horse_id'=>$horsesitem['id']), '`order_num`');
            }
            $horsesitem['horse_photos'] = $horsesphotos;
            $horsesitem['pedigree'] =  unserialize($horsesitem['pedigree']);
            $horsesitem['facebook'] = $facebookEnabled;
            $horsesitem['sendToFbDefault'] = $sendToFbDefault;
            // $pedigree = json_encode($pedigree);
            
            $this->data['item'] = $horsesitem;
            $this->data['pedigree'] = $pedigree;
            
        }
    }
        

?>