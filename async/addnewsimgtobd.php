<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_AddNewsImgtobd_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            // Extract inputs
            $file = $this->_getString('file', $_params, false);
            $newsid = $this->_getString('newsid', $_params, true);
            
            $user = $mySql->getRecord('users', array('domain_id'=>$_domainId));
            $userId = $user['id'];
            
            $mySql->insert('news_images', array('ni_image' => $file, 'ni_user_id' => $userId, 'ni_news_id' => $newsid));
            $insertId = mysql_insert_id();
            
            $newsImg = $mySql->getRecord('news_images', array('ni_id'=>$insertId));

            $this->data['newsImg'] = $newsImg;
            
        }
    }
        

?>