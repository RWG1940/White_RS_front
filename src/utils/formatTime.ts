import dayjs from 'dayjs'

export const formatTime = (value: string) => {
    if (!value) {
        return ''
    }
    return dayjs(value).format("YYYY-MM-DD HH:mm")
}