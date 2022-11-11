module.exports = {
    welcomeMail(name) {
        return `
        <body style="font-family: sans-serif;">
        <div style="margin: 0px 200px;">
            <div style="display:flex;">
                <img src="https://api.pabjobs.com/public/mail/welcome/Pabjobs.png" height="100px" width="150px" />
                <div style="padding-left:160px;">
                    <p style="text-align: center; font-size: 16px;">Welcome to Pabjobs, ${name}!</p>
                    <h2 style="text-align: center;  font-size: 24px;">A message from our TEAM</h2>
                </div>
                <!-- <div style="visibility: hidden;">
                    <p style="text-align: center; font-size: 16px;">Welcome to Pabjobs, ${name}!</p>
                    <h2 style="text-align: center;  font-size: 24px;">A message from our TEAM</h2>
                </div> -->
            </div>
            <div>
                <fieldset style="border: 1px solid #270D44; padding: 30px;">
                    <legend><i class="fas fa-quote-left" style="font-size: 30px; color: #270D44;"></i></legend>
                    <p>Welcome to the PAB JOBS of 7M+ job seekers!</p>
                    <p>At Pabjobs, we help you get discovered by 5 Lakh+ top recruiters hiring talent like you.</p>
                    <p>
                        Before you get started ensure you are visible to recruiters by completing your profile.
                    </p>
                </fieldset>
            </div>
            <div style="text-align: center ; padding:20px">
                <a href="#" style="padding: 12px; background-color: #270D44; color: white;">GET STARTED</a>
            </div>
            <div style="margin: 0px 260px;">
                <h2 style="text-align: center;">You are <span style="color: rgb(230, 163, 109);">not visible</span> to
                    recruiters yet!</h2>
                <p style="text-align: center;">Industry experts suggest to have a complete profile to begin your hiring!</p>
            </div>
            <!-- <div style=" text-align: center; margin-top: 100px;" >
                <img src="https://api.pabjobs.com/public/mail/welcome/People.jpeg" style="margin-top: -40px; margin-left: -38px;"/>
                
            </div> -->
            <div style="border: 1px solid #270D44; display: flex; margin-top: 70px;">
                <div style="text-align: center; width:50%; padding-top: 30px; margin-top: 30px;">
                    <i class="fas fa-check"
                        style="border-radius: 50%; background-color:  #270D44; padding:4px; color: white;"></i>
                    <p style="text-align: center">00 actions completed</p>
                </div>
                <div style=" text-align: center; margin-top: 5px;">
                    <img src="https://api.pabjobs.com/public/mail/welcome/People.jpeg" style="margin-top: -40px;  width: 70px; height: 70px;" />
                    <h3 style="color: red;">10%</h3>
    
                </div>
                <div style="text-align: center; width:50%; padding-top: 30px; margin-top: 30px;">
                    <i class="fas fa-plus"
                        style="border-radius: 50%; background-color: #270D44; padding:4px; color: white; text-align: center;"></i>
                    <p>15 actions pending</p>
                </div>
            </div>
            <div style="text-align:center; margin-top: 10px;">
                <a href="#" style="color: #270D44;">Add missing details <i class="fas fa-arrow-right" style="font-size: 12px; color: #270D44"></i></a>
            </div>
    
            <div style="margin: 0px 260px;">
                <h2 style="text-align: center; font-size: 20px;">Here are some unique ways to ensure you get your right job!
                </h2>
            </div>
    
            <div style="margin-top: 30px; display: flex;">
                <div style="border: 1px solid #270D44 ; width: 50%; height: 150px; margin-right: 10px">
                    <p style="padding: 10px 20px;"><i class="fas fa-file-invoice"
                            style="color: #270D44; font-size: 23px;"></i></p>
                    <div style="margin-left: 20px;">
                        <p>
                            Get discovered by<br>
                            top recruiters<br>
                            <a href="#" style="color: #270D44;">Upload Resume<i class="fas fa-greater-than"
                                    style="font-size: 11px; padding-left: 3px; color: #270D44;"></i></a>
                        </p>
                    </div>
                </div>
                <div style="border: 1px solid #270D44; width: 50%; height: 150px;  margin-left: 10px">
                    <p style="padding: 10px 20px;"><i class="fas fa-envelope"
                            style="color: #270D44; font-size: 23px;"></i></p>
                    <div style="margin-left: 20px;">
                        <p>
                            Get Recommended jobs 
                            <br>
                            <a href="#" style="color: #270D44;">Upload Resume<i class="fas fa-greater-than"
                                    style="font-size: 11px; padding-left: 3px; color: #270D44;"></i></a>
                                    
                        </p>
                    </div>
                </div>
            </div>
    
            <div style="margin-top: 30px; display: flex;">
                <div style="border: 1px solid #270D44 ; width: 50%; height: 150px; margin-right: 10px;">
                    <p style="padding: 10px 20px;"><i class="fas fa-suitcase" style="color: #270D44; font-size: 23px;"></i>
                    </p>
                    <div style="margin-left: 20px;">
                        <p>
                            Get customised job<br>
                            recommendations<br>
                            <a href="#" style="color: #270D44;">Update Preferences
                                <i class="fas fa-greater-than" style="font-size: 11px; padding-left: 3px; color: #270D44;"></i></a>
                        </p>
                    </div>
                </div>
                <div style="border: 1px solid #270D44 ; width: 50%; height: 150px; float: right; margin-left: 10px;">
                    <p style="padding: 10px 20px;"><i class="fas fa-bell" style="color: #270D44); font-size: 23px;"></i></p>
                    <div style="margin-left: 20px;">
                        <p>
                            Get job updates in<br>
                            your inbox<br>
                            <a href="#" style="color: #270D44;">Create Alert<i class="fas fa-greater-than"
                                    style="font-size: 11px; padding-left: 3px;"></i></a>
                        </p>
                    </div>
                </div>
            </div>
    
            <div style="display: flex; margin-top: 30px; background-color: rgb(240, 245, 248);">
                <div style="width:80%; margin-left: 20px;">
                    <h4>Applies are a click away on the app</h4>
                    <spa>Available on</spa>
                    <img src="https://api.pabjobs.com/public/mail/welcome/PlayStore.jpeg" style="height: 18px; width: 18px; padding-left: 10px;" />
                    <img src="https://api.pabjobs.com/public/mail/welcome/Apple.jpeg" style="height: 18px; width: 18px; padding-left: 10px;" />
                    <div style="margin-top: 10px;">
                        <a href="#" style="background-color:#270D44;color: white; padding: 9px; margin-top: 120px;">Get
                            App</a>
                    </div>
                </div>
                <div style="margin-top: 60px; justify-content: flex-end; ">
                    <img src="https://api.pabjobs.com/public/mail/welcome/Mobile.jpeg" width="80%" height="80%" />
                </div>
            </div>
    
    
    
    
    
    
        </div>
    </body>
    
        `
    }

}