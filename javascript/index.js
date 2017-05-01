class ImagesLoader extends React.Component{
  constructor(props){
    super(props)
    this.state = {images: []}
    this.AddImages = this.AddImages.bind(this)
    this.handleUpdateImages = this.handleUpdateImages.bind(this)
  }

  AddImages(e){
    e.preventDefault()
    let images= []
    let files = e.dataTransfer.files
    for(let i = 0; i < files.length;i++){
      let file = files[i]
      if(file.type.split('/')[0] === "image"){
        let name = file.name.substring(0,file.name.lastIndexOf("."))
        let newImage = {
          title: name,
          file: file,
          category: 1
        }
        images.push(newImage)
      }
    }
    this.setState({
      images: images
    })
  }

  handleUpdateImages(upImages){
    this.setState({images: upImages})
  }

  render(){
    return(
      <div
        className="ImagesLoader">
        <Droparea onDropFiles={this.AddImages}/>
        <Previews
          images={this.state.images}
          onUpdateImages={this.handleUpdateImages}
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

  render(){
    return(
      <div
        className="Droparea"
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.props.onDropFiles}>
        <span className="Droparea-text"> Drag your elements Here. </span>
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
    this.state = {imageLoaded: false, removed: false}
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeCategory = this.handleChangeCategory.bind(this)
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

  handleImageLoaded(){
    this.setState({imageLoaded: true})
  }

  handleDeleteItem(){
    this.setState({removed: true})
  }

  handleDeleteTransitionEnd(){
    this.props.onDeleteItem(this.props.image)
  }

  render(){
    let clases = "Preview-item" + (this.state.removed ? " removed" : "")
    if(!this.state.imageLoaded){
      return (
        <li
          className={clases}
          >
          <PreviewItemImg
            image={this.props.image}
            onImageLoaded={this.handleImageLoaded}
          />
        </li>
      )
    }

    if (this.state.removed) {
      return(
        <li
          className={clases}
          onAnimationEnd={this.handleDeleteTransitionEnd}>
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
    }

    return(
      <li
        className={clases}>
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
  }
}

class PreviewItemImg extends React.Component{
  constructor(props){
    super(props)
    this.state = {image: this.props.image, src: false, visible: false}
    this.getImage().then(img => {
      this.setState({src: img.src})
    })
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
  }

  handleImageLoaded(){
    this.setState({visible: true})
  }

  getImage(){
    return new Promise((resolve,reject) => {
      let image = this.props.image.file
      let fileReader = new FileReader()
      fileReader.onload = function(){
        let base64 = this.result
        let img = new Image()
        img.onload = function(){
          resolve(this)
        }
        img.src = base64
      }
      fileReader.readAsDataURL(image)
    })
  }

  render(){
    if(!this.state.src){
      return null
    }
    let clases = "Preview-item-img " + (this.state.visible ? "visible" : "")
    return(
      <div className={clases}
           onTransitionEnd={this.props.onImageLoaded}>
        <img
          className="Item-img"
          src={this.state.src}
          onLoad={this.handleImageLoaded}
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

ReactDOM.render(
  <ImagesLoader />,
  document.getElementById('root')
);
