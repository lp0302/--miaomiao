// components/search/search.js
const app = getApp()
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  options:{
    styleIsolation:'apply-shared'
  },
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isFocus:false,
    historyList:[],
    searchList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleFoucs(){
      wx.getStorage({//获取光标时取数据
        key: 'searchHistory',
        success: (res)=> {
          // console.log(res.data)
          this.setData({
            historyList:res.data
          })
        }
      })

      this.setData({
        isFocus:true
      })
    },
    handleCancel(){
      this.setData({
        isFocus:false,
        inputValue:''

      })
    },
    handleConfirm(ev){//点击回车
      //找到数组，并克隆一份
      let value=ev.detail.value
      let cloneHistoryList = [...this.data.historyList]
      cloneHistoryList.unshift(value)
      wx.setStorage({
        key:"searchHistory",
        data:[...new Set(cloneHistoryList)]//添加历史记录，但是如果之前搜索过应该只有一个并且直接放在历史记录之前，要去重，set本身不是数组类型，所以要转成数组
      })
      this.changeSearchList(value)
    },
    handleHistoryDelete(){
      wx.removeStorage({
        key: 'searchHistory',
        success:(res)=>{
           this.setData({
             historyList:[]
           })
        }
      })
    },
    changeSearchList(value){
      db.collection('users').where({//这里查询数据库输入一个字母单词就应该查询到数据（模糊的匹配，用正则查询db.regexp）
        nickName:db.RegExp({
          regexp:value,
          options:'i' //忽略大小写
        })
      }).field({
          userPhoto:true,
          nickName:true
        }).get().then((res)=>{
          console.log(res)
          this.setData({
            searchList:res.data
          })
        })
      
    },
    handleHistoryItemDel(ev){
      let value=ev.target.dataset.text
      this.changeSearchList(value)
    }
  },
  
})
