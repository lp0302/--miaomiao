// components/removeList/removeList.js
const app = getApp();
const db = wx.cloud.database()
const _=db.command //计算
Component({
  /**
   * 组件的属性列表
   */
  properties: {
     messageId:String
  },

  /**
   * 组件的初始数据
   */
  data: {
     userMessage: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleDellMessage(){
      wx.showModal({
        title: '提示信息',
        content: '删除消息',
        confirmText:'删除',
        success: (res)=> {
          if (res.confirm) {
            this.removeMessage()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    handleAddFriend(){
      //添加数据操作
      wx.showModal({
        title: '提示信息',
        content: '申请好友',
        confirmText:'同意',
        success: (res)=> {
          if (res.confirm) {
            db.collection('users').doc(app.userInfo._id).update({
              data:{
                friendList:_.unshift(this.data.messageId)
                //_是引入的db.command进行计算
              }
            }).then((res)=>{})
            wx.cloud.callFunction({
              name:"update",
              data:{
                collection:'users',
                doc:this.data.messageId,
                data:`{friendList:_.unshift('${app.userInfo._id}')}`
              }
            }).then((res)=>{})
            this.removeMessage()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    removeMessage(){
      //先查询在更新
      db.collection("message").where({
        userId: app.userInfo._id
      }).get().then((res)=>{
          let list=res.data[0].list;
          list=list.filter((val,i)=>{
             return val != this.data.messageId
          })
          wx.cloud.callFunction({
            name:'update',
            data: {
              collection:'message',
              where: {
                userId:app.userInfo._id
              },
              data: {
                list
              }
            }
          }).then((res)=>{
            //组件之间的通信哪条数据被删除
            this.triggerEvent('myevent', list)
          })
      })
    }
  },
  lifetimes: {
    //该方法删除之后不会再次触发
    attached: function() {
      // 在组件实例进入页面节点树时执行
      db.collection('users').doc(this.data.messageId).field({
        userPhoto:true,
        nickName:true,
      }).get().then((res)=>{
        // console.log(res)
        this.setData({
          userMessage: res.data
        })
      })
    }
  },
  
})
