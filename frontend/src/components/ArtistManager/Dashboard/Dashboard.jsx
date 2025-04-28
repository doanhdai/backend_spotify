const Dashboard = () => {
    return (
        <div className="flex flex-col w-full px-10 py-3">
            <div className="mt-3 font-bold text-black text-2xl border-black rounded-lg">
                <h2>Chào buổi sáng, ltgiai !</h2>
            </div>
            <div className="py-4 w-full bg-white">
                <div className="grid grid-cols-3 gap-4">
                    <div className="border-2 border-solid text-black border-black p-4 rounded-lg">
                        <h3>Bài hát</h3>
                        <p className="text-2xl font-bold">12</p>
                    </div>

                    <div className="border-2 border-solid text-black border-black p-4 rounded-lg">
                        <h3>Album</h3>
                        <p className="text-2xl font-bold">3</p>
                    </div>

                    <div className="border-2 border-solid text-black border-black p-4 rounded-lg">
                        <h3>Lượt yêu thích</h3>
                        <p className="text-2xl font-bold">300</p>
                    </div>
                    {/* Thêm 3 card tương tự */}
                </div>
                <div className="mt-6 border-2 border-solid text-black border-black p-4 rounded-lg">
                    <h2>Bài hát yêu thích nhất</h2>
                </div>
                <div className="mt-6 border-2 border-solid text-black border-black p-4 rounded-lg">
                    <h2>Biểu đồ thống kê</h2>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;