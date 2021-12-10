module.exports = {
    publicPath: '/static',
    devServer: {
        port: 3001,
        proxy: {
            '/api' :{
                target: 'http://localhost:3000'
            }
        }
    }
}
