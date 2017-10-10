<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    /* Set horses video fb post id
    *  created Denis Kucher <dkucher88@gmail.com>
    *  @since 12.09.2017
    */

    class Basic_SetHorseVideoFbPostId_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $id = $this->_getString('fbPostId', $_params, true);
            $videoid = $this->_getString('videoid', $_params, true);
            
            $mySql->update('horse_videos_v2', array('fb_post_id' => $id), array('id' => $videoid));
           
        }
    } 

?>