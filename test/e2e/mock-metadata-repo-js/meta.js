module.exports = {
    prompts: {
        description: {
            type: 'string',
            required: true,
            message: 'Project description'
        },
        name: {
            type: 'string',
            required: true,
            label: 'Project name',
            validate: function (input) {
                return input === 'custom' ? 'can not input `custom`' : true;
            }
        }
    },
    skipInterpolation: 'src/*-{one,two}.san'
};
