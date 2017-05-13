class ImagesLoader extends React.Component{
  constructor(props){
    super(props)
    this.state = {images: []}
    this.handleUpdateImages = this.handleUpdateImages.bind(this)
    this.handleAddImage = this.handleAddImage.bind(this)
    this.handleClearImages = this.handleClearImages.bind(this)
  }

  handleAddImage(newImage){
    let images = this.state.images
    let loaded = false
    images.map(image => {
      if(image.data === newImage.data){
        loaded = true
      }
    })
    if(!loaded){
      images.push(newImage)
      this.setState({images: images})
    }
  }

  handleClearImages(){
    this.setState({images: []})
  }

  handleSubmitImages(){
    console.log('Se eviaran los archivos:')
    console.log(this.state.images)
  }

  handleUpdateImages(upImages){
    this.setState({images: upImages})
  }

  render(){
    return(
      <div
        className="ImagesLoader">
        <Droparea
          empty={(this.state.images.length > 0) ? false : true}
          onAddImage={this.handleAddImage}/>
        <Previews
          images={this.state.images}
          onUpdateImages={this.handleUpdateImages}
        />
        <ActionsBar
          onClearImages={this.handleClearImages}
          onSubmitImages={this.handleSubmitImages}
          visible={(this.state.images.length > 0) ? true : false}
        />
      </div>
    )
  }
}

class Droparea extends React.Component{
  constructor(props){
    super(props)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
  }

  getData(file){
    return new Promise(resolve => {
      let fileReader = new FileReader()
      fileReader.onload = function(){
          resolve(this.result)
      }
      fileReader.readAsDataURL(file)
    })
  }

  handleDrop(e){
    e.preventDefault()
    let files
    if(typeof e.dataTransfer === "undefined"){
      files = e.target.files
    } else {
      files = e.dataTransfer.files
    }
    for(let i = 0; i < files.length;i++){
      let file = files[i]
      if(file.type.split('/')[0] === "image"){
        let name = file.name.substring(0,file.name.lastIndexOf("."))
        this.getData(file).then(base64 => {
          let newImage = {
            title: name,
            file: file,
            data: base64,
            category: 1
          }
          this.props.onAddImage(newImage)
        })
      }
    }
  }

  handleDragOver(e){
    e.preventDefault()
    let target = e.target
    target.classList.add('over')
  }

  handleDragLeave(e){
    e.preventDefault()
    let target = e.target
    target.classList.remove('over')
  }

  handleClick(e){
    this.filesInput.click()
  }

  render(){
    return(
      <div
        className={"Droparea" + (!this.props.empty ? " loaded": "")}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onClick={this.handleClick}>
        <span className="Droparea-text"> Drag your elements Here. </span>
        <input
          className="hidden-input"
          type="file"
          multiple
          ref={(input) => this.filesInput = input}
          onChange={this.handleDrop}
        />
      </div>
    )
  }
}


class Previews extends React.Component{
  constructor(props){
    super(props)
    this.handleChangeItem = this.handleChangeItem.bind(this)
    this.handleDeleteItem = this.handleDeleteItem.bind(this)
  }

  handleChangeItem(oldItem,prop,newValue){
    let images = this.props.images
    images.map((image) => {
      if(image === oldItem){
        image[prop] = newValue
      }
    })
    this.props.onUpdateImages(images)
  }

  handleDeleteItem(oldItem){
    let images = this.props.images
    images.map((image) => {
      if(image === oldItem){
        let i = images.indexOf(image)
        i !== -1 && images.splice(i,1)
      }
    })
    this.props.onUpdateImages(images)
  }

  render(){
    let images = this.props.images
    const imageList = images.map(image =>
      <PreviewItem
            key={image.file.name}
            image={image}
            onChangeItem={this.handleChangeItem}
            onDeleteItem={this.handleDeleteItem}/>
    )

    return(
      <ul className="Previews">
        {imageList}
      </ul>
    )
  }
}

class PreviewItem extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      visible: false,
      classCss: 'Preview-item'
    }
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeCategory = this.handleChangeCategory.bind(this)
    this.handleChangeData = this.handleChangeData.bind(this)
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleDeleteItem = this.handleDeleteItem.bind(this)
    this.handleDeleteTransitionEnd = this.handleDeleteTransitionEnd.bind(this)
  }

  handleChangeTitle(value){
    this.props.onChangeItem(this.props.image,'title',value)
  }

  handleChangeCategory(value){
    this.props.onChangeItem(this.props.image,'category',value)
  }

  handleChangeData(data){
    this.props.onChangeItem(this.props.image,'data',data)
  }

  handleImageLoaded(){
    this.setState({
      visible: true,
      classCss: 'Preview-item' + ' visible'
    })
  }

  handleDeleteItem(){
    this.setState({
      visible: false,
      classCss: 'Preview-item'
    })
  }

  handleDeleteTransitionEnd(){
    this.props.onDeleteItem(this.props.image)
  }

  render(){
    if (!this.state.visible) {
      return(
        <li
          className={this.state.classCss}
          onTransitionEnd={this.handleDeleteTransitionEnd}
          >
          <PreviewItemImg
            image={this.props.image}
            onImageLoaded={this.handleImageLoaded}
          />
          <PreviewItemForm
            image={this.props.image}
            onChangeTitle={this.handleChangeTitle}
            onChangeCategory={this.handleChangeCategory}
            onDeleteItem={this.handleDeleteItem}
            />
        </li>
      )
    } else {
      return(
        <li
          ref={(li) => this.element = li}
          className={this.state.classCss}>
          <PreviewItemImg
            image={this.props.image}
            onChangeData={this.handleChangeData}
            onImageLoaded={this.handleImageLoaded}
          />
          <PreviewItemForm
            image={this.props.image}
            onChangeTitle={this.handleChangeTitle}
            onChangeCategory={this.handleChangeCategory}
            onDeleteItem={this.handleDeleteItem}
            />
        </li>
      )
    }
  }
}

class PreviewItemImg extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      image: this.props.image
    }
  }

  render(){
    if(!this.state.image){
      return null
    }
    let clases = "Preview-item-img"
    return(
      <div className={clases}>
        <img
          className="Item-img"
          src={this.state.image.data}
          onLoad={this.props.onImageLoaded}
        />
      </div>
    )
  }
}

class PreviewItemForm extends React.Component{
  constructor(props){
    super(props)
    let title = (this.props.image.file.name === this.props.image.name)
             ? this.props.image.file.name
             : this.props.image.title
    this.state = {
      title: title,
      category: this.props.image.category
    }
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeCategory = this.handleChangeCategory.bind(this)
    this.handleLoadForm = this.handleLoadForm.bind(this)
  }

  handleChangeTitle(e){
    let value = e.target.value
    this.setState({title: value})
    this.props.onChangeTitle(value)
  }

  handleChangeCategory(e){
    let value = e.target.value
    this.setState({category: value})
    this.props.onChangeCategory(value)
  }

  handleLoadForm(e){
    this.setState({formLoaded: true})
  }


  render(){
    const categories = [
      {value: 1, name: 'Animals'},
      {value: 2, name: 'Cgi'},
      {value: 3, name: 'Landscapes'},
      {value: 4, name: 'Women'}
    ]
    return(
      <form
        className="Preview-item-form"
        onLoad={this.handleLoadForm}>
        <label>Title
          <input type="text"
                 placeholder="Insert title"
                 onChange={this.handleChangeTitle}
                 value={this.state.title}
          />
        </label>
        <label>Category
          <select value={this.state.category}
                  onChange={this.handleChangeCategory}>
            {
              categories.map((c) =>
                <option
                  key={c.value}
                  value={c.value}>
                  {c.name}
                </option>
              )
            }
          </select>
        </label>
        <button
          type="button"
          className="Delete-button"
          onClick={this.props.onDeleteItem}
          >Delete
        </button>
      </form>
    )
  }
}

class ActionsBar extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    if(this.props.visible){
      return(
        <div
          className="Actions-Bar">
          <button
            className="submit-btn"
            type="button"
            onClick={this.props.onSubmitImages}>
            Submit
          </button>
          <button
            className="clear-btn"
            type="button"
            onClick={this.props.onClearImages}
            >
            Clear
          </button>
        </div>
      )
    } else {
      return null
    }
  }
}
ReactDOM.render(
  <ImagesLoader />,
  document.getElementById('root')
);
