const news = require('../models/news')
const notifications = require('../models/notifications')

exports.addNews = async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const newNews = await news.create(req.body)

    if (!newNews) {
      res.status(400).json({ message: 'Failed to add news' })
    }else {
        res.status(200).json('News added successfully')
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getNews = async (req, res) => {
    try {
        const newsData = await news.find()

        if(newsData.length){
            res.status(200).send(newsData)
        }else{
            res.status(404).send("News not found")
        }
    } catch (error) {
        res.status(500).send('Server error')
        console.log(error)
    }
}


exports.deleteNews = async (req, res) => {
        const newsId = req.params.id
    try {
        if(!newsId){
            res.status(404).send('News not found')
        }else{
            await news.findByIdAndDelete(newsId)
            res.status(200).send('News deleted successfully')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
}

exports.getNotifications = async (req, res) => {
    const role = req.params.role
    try {
        const notificationsData = await notifications.find({
            for: {
                $in: [role]
            }
        })

        if(notificationsData.length){
            res.status(200).send(notificationsData)
        }else{
            res.status(401).send("Notifications not found")
        }
    } catch (error) {
        res.status(500).send('Server error')
        console.log(error)
    }
}

exports.readAllNotifications = async (req, res) => {
    const userId = req.params.id 
    try {
        await notifications.updateMany(
            {},
            {
                $addToSet: { read: userId  }
            }
        )

        res.status(200).send('Read all notifications')
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error: ', error)
    }
}