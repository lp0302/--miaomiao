// miniprogram/pages/user/user.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPhoto:"/images/user/user-unlogin.png",
    nickName:'小喵喵',
    logged:false,
    disabled:true, //设登陆按钮最开始不能点击
    id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getLocation()
    //云开发授权登陆，如果上次是登陆状态就直接显示用户信息页面
     wx.cloud.callFunction({
       name: 'login',
       data: {}
     }).then((res)=>{
      //  console.log(res);
      db.collection('users').where({
        _openid:res.result.openid
      }).get().then((res)=>{
        if(res.data.length) {
            app.userInfo = Object.assign(app.userInfo, res.data[0]);
            this.setData({
              userPhoto: app.userInfo.userPhoto,
              nickName: app.userInfo.nickName,
              logged: true,
              id:app.userInfo._id
            })
            //登陆成功获取消息
            this.getMessage();
        }else{
          this.setData({//没有登陆信息的时候就让登陆按钮能点
            disabled:false
          })
        }
      
      })
     })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userPhoto: app.userInfo.userPhoto,
      nickName: app.userInfo.nickName,
      id:app.userInfo._id
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindGetUserInfo(ev){
    // console.log(ev)
    let userInfo = ev.detail.userInfo;
    //未登录前创建表
    if(!this.data.logged && userInfo){
      //添加的集合及字段
       db.collection('users').add({
         data: {
           userPhoto:userInfo.avatarUrl,
           nickName:userInfo.nickName,
           signature:'',
           phoneNumber: '',
           weixinNumber: '',
           links: 0,
           time: new Date(),
           isLocation: true, //位置共享
           latitude:this.latitude,
           longitude:this.longitude,
           location:db.Geo.Point(this.longitude,this.latitude),
           friendList:[]
         }
       }).then((res)=>{
          //成功后取用户信息登陆
          //  console.log(res);
          db.collection('users').doc(res._id).get().then((res) => {
            // console.log(res.data)
            app.userInfo = Object.assign(app.userInfo,res.data);
            this.setData({
              userPhoto: app.userInfo.userPhoto,
              nickName: app.userInfo.nickName,
              logged: true,
              id:app.userInfo._id
            })
          })
       });
    }
  },
  getMessage(){
    //监听消息的变化
    db.collection('message').where({//查询
      userId:app.userInfo._id
    }).watch({//监听数据库变化
      onChange: function(snapshot) {
        if(snapshot.docChanges.length){
          let list = snapshot.docChanges[0].doc.list
          if(list.length){
            wx.showTabBarRedDot({//显示红点
              index: 2,
            })
            app.userMessage = list
          }else{
            wx.hideTabBarRedDot({
              index: 2,
            })
            app.userMessage=[]
          }
        }
       
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  },
  getLocation(){
    wx.getLocation({
      type: 'gcj02',
      success: (res)=> {
        this.latitude = res.latitude
        this.longitude = res.longitude
       
      }
     })
  }

})