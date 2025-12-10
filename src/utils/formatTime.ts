import dayjs from 'dayjs'

export const formatTime = (value: string) => {
    return dayjs(value).format("YYYY-MM-DD-HH:mm")
}