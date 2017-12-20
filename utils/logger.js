// Create a simple placeholder for more sophisticated logger.

module.exports = {
    info: (msg) => console.log(JSON.stringify(msg)),
    debug: (msg) => console.log(JSON.stringify(msg)),
    error: (error) => console.log(JSON.stringify(error))
};